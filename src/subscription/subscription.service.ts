import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { createCheckout, NewCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Subscription, User } from '@prisma/client'
import { Cache } from 'cache-manager'
import { createHmac, timingSafeEqual } from 'crypto'
import { PaymentsService } from './payments/payments.service'
import { GetSubscriptionInput, SubscribeInput } from './subscription.dto'
import {
	TypeEvent,
	TypeInvoiceEvent,
	TypeOrderEvent
} from './subscription.types'

type CountryCode = NewCheckout['checkoutData']['billingAddress']['country']

const APPROXIMATELY_3_MONTHS_IN_MS = 6_912_000_000

@Injectable()
export class SubscriptionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
		private readonly paymentsService: PaymentsService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async get(userId: string) {
		try {
			const cachedSubscription = await this.cache.get<Subscription>(
				`subscription:${userId}`
			)

			if (cachedSubscription) {
				return cachedSubscription
			}

			const subscription = await this.prisma.subscription.findUnique({
				where: {
					userId
				}
			})
			if (!subscription) {
				throw new NotFoundException('Subscription not found')
			}

			await this.cache.set(`subscription:${userId}`, subscription)

			return subscription
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async checkout(dto: SubscribeInput, user: User) {
		try {
			const billingInfo = await this.prisma.billingInfo.findUnique({
				where: {
					userId: user.id
				}
			})

			if (!billingInfo) {
				throw new BadRequestException('You need to provide billing info first')
			}

			const { data, error } = await createCheckout(
				this.config.get('LEMON_SQUEEZY_STORE_ID'),
				dto.productId,
				{
					checkoutData: {
						email: billingInfo.email ?? user.email,
						name: `${billingInfo.firstName} ${billingInfo.lastName}`,
						billingAddress: {
							country: billingInfo.country as CountryCode,
							zip: billingInfo.postalCode
						},
						custom: {
							userId: user.id
						}
					}
				}
			)

			if (error) {
				throw new InternalServerErrorException(
					'Failed to create checkout session',
					{
						description: error.message
					}
				)
			}

			return data.data.attributes.url
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async validateWebhook(rawBody: Buffer, signatureHeader: string) {
		const secret = this.config.get('LEMON_SQUEEZY_WEBHOOK_SECRET')
		const hmac = createHmac('sha256', secret)
		const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf-8')
		const signature = Buffer.from(signatureHeader ?? '', 'utf-8')

		if (!timingSafeEqual(digest, signature)) {
			throw new InternalServerErrorException('Internal server error')
		}
	}

	public async getSubscription(dto: GetSubscriptionInput) {
		const subscription = await this.prisma.subscription.findUnique({
			where: {
				userId: dto.userId
			}
		})

		if (!subscription) {
			throw new BadRequestException('Subscription not found')
		}

		return subscription
	}

	public async createSubscription(event: TypeEvent) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: event.meta.custom_data.user_id
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		await this.prisma.subscription.create({
			data: {
				userId: user.id,
				lsSubscriptionId: event.data.id,
				createdAt: event.data.attributes.created_at,
				endsAt: event.data.attributes.ends_at ?? event.data.attributes.renews_at
			}
		})
	}

	public async updateSubscription(event: TypeEvent) {
		const subscription = await this.getSubscription({
			userId: event.meta.custom_data.user_id
		})

		const endsAt = event.data.attributes.ends_at
		const endsAtMiliSec = endsAt ? new Date(endsAt).getTime() : 0

		if (
			endsAtMiliSec &&
			endsAtMiliSec > subscription.endsAt.getTime() &&
			endsAtMiliSec - subscription.endsAt.getTime() >=
			APPROXIMATELY_3_MONTHS_IN_MS
		) {
			await this.prisma.subscription.update({
				where: {
					id: subscription.id
				},
				data: {
					endsAt: event.data.attributes.ends_at
				}
			})
		}
	}

	public async deleteSubscription(event: TypeEvent) {
		await this.prisma.subscription.delete({
			where: {
				userId: event.meta.custom_data.user_id,
				lsSubscriptionId: event.data.id
			}
		})
		await this.cache.del(`subscription:${event.meta.custom_data.user_id}`)
	}

	public async createPayment(event: TypeInvoiceEvent) {
		const userId = event.meta.custom_data.user_id
		const subscription = await this.getSubscription({
			userId
		})

		const { billing_reason, subtotal, tax, total, status } =
			event.data.attributes

		if (status !== 'paid') {
			console.error('Payment status is not "paid":', status)
			throw new BadRequestException('Invalid payment status')
		}

		await this.paymentsService.create({
			billingReason: billing_reason,
			subtotal: subtotal / 100,
			tax: tax / 100,
			total: total / 100,
			subscriptionId: subscription.id,
			userId,
			lsSubscriptionId: event.data.attributes.subscription_id.toString()
		})
	}

	public async createUnlimiteSubscription(event: TypeOrderEvent) {
		const userId = event.meta.custom_data.user_id
		const existingSubscription = await this.getSubscription({
			userId
		})

		if (existingSubscription) {
			await this.prisma.subscription.delete({
				where: {
					id: existingSubscription.id
				}
			})
		}

		const newSubscription = await this.prisma.subscription.create({
			data: {
				isUnlimite: true,
				lsSubscriptionId: event.data.id,
				userId: event.meta.custom_data.user_id
			}
		})

		const { subtotal, tax, total } = event.data.attributes

		await this.paymentsService.create({
			billingReason: 'initial',
			subtotal: subtotal / 100,
			tax: tax / 100,
			total: total / 100,
			subscriptionId: newSubscription.id,
			userId,
			lsSubscriptionId: event.data.id
		})
	}

	public async checkIfSubscribed(userId: string): Promise<boolean> {
		const subscription = await this.prisma.subscription.findUnique({
			where: {
				userId
			}
		})

		if (!subscription) {
			return false
		}

		if (Date.now() > subscription.endsAt.getTime()) {
			await this.prisma.subscription.delete({
				where: {
					id: subscription.id
				}
			})
			return false
		}

		return true
	}
}
