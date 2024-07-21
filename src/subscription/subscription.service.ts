import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { createHmac, timingSafeEqual } from 'crypto'
import { GetSubscriptionInput, SubscribeInput } from './subscription.dto'
import {
	TypeEvent,
	TypeInvoiceEvent,
	TypeOrderEvent
} from './subscription.types'

const APPROXIMATELY_3_MONTHS_IN_ML = 6_912_000_000

@Injectable()
export class SubscriptionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService
	) {}

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
						email: billingInfo?.email ?? user.email,
						name: `${billingInfo.firstName} ${billingInfo.lastName}`,
						billingAddress: {
							country: billingInfo.country as any,
							zip: billingInfo.postalCode,
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
		const subscription = await this.prisma.subscriptions.findUnique({
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

		await this.prisma.subscriptions.create({
			data: {
				userId: user.id,
				productId: event.data.attributes.variant_id,
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
				APPROXIMATELY_3_MONTHS_IN_ML
		) {
			await this.prisma.subscriptions.update({
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
		await this.prisma.subscriptions.delete({
			where: {
				userId: event.meta.custom_data.user_id,
				lsSubscriptionId: event.data.id
			}
		})
	}

	public async createPayment(event: TypeInvoiceEvent) {
		const subscription = await this.getSubscription({
			userId: event.meta.custom_data.user_id
		})

		const { billing_reason, subtotal, tax, total, status } =
			event.data.attributes

		if (status !== 'paid') {
			console.error('Payment status is not "paid":', status)
			throw new BadRequestException('Invalid payment status')
		}

		await this.prisma.payments.create({
			data: {
				billingReason: billing_reason,
				subtotal,
				tax,
				total,
				subscriptionId: subscription.id
			}
		})
	}

	public async createUnlimiteSubscription(event: TypeOrderEvent) {
		const existingSubscription = await this.getSubscription({
			userId: event.meta.custom_data.user_id
		})

		if (existingSubscription) {
			await this.prisma.subscriptions.delete({
				where: {
					id: existingSubscription.id
				}
			})
		}

		const newSubscription = await this.prisma.subscriptions.create({
			data: {
				isUnlimite: true,
				lsSubscriptionId: event.data.id,
				productId: event.data.attributes.first_order_item.variant_id,
				userId: event.meta.custom_data.user_id
			}
		})

		const { subtotal, tax, total } = event.data.attributes

		await this.prisma.payments.create({
			data: {
				billingReason: 'initial',
				subtotal,
				tax,
				total,
				subscriptionId: newSubscription.id
			}
		})
	}

	public async checkIfSubscribed(userId: string): Promise<boolean> {
		const subscription = await this.prisma.subscriptions.findUnique({
			where: {
				userId
			}
		})

		if (!subscription) {
			return false
		}

		if (Date.now() > subscription.endsAt.getTime()) {
			await this.prisma.subscriptions.delete({
				where: {
					id: subscription.id
				}
			})
			return false
		}

		return true
	}
}