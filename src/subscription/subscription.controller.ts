import {
	Body,
	Controller,
	Get,
	Headers,
	Post,
	RawBody,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SubscribeInput } from './subscription.dto'
import { SubscriptionService } from './subscription.service'

import { AuthenticatedGuard, CurrentUser } from '@/common'
import {
	EventName,
	TypeEvent,
	TypeInvoiceEvent,
	TypeOrderEvent
} from '@/subscription/subscription.types'
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import { User } from '@prisma/client'

@Controller('subscription')
export class SubscriptionController {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly config: ConfigService
	) {
		lemonSqueezySetup({
			apiKey: config.get('LEMON_SQUEEZY_API_KEY')
		})
	}

	@UseGuards(AuthenticatedGuard)
	@Get()
	getSubscription(@CurrentUser('id') userId: string) {
		return this.subscriptionService.get(userId)
	}

	@UseGuards(AuthenticatedGuard)
	@Post('')
	checkout(@Body() dto: SubscribeInput, @CurrentUser() user: User) {
		return this.subscriptionService.checkout(dto, user)
	}

	@Post('webhooks')
	async webhooks(
		@RawBody() rawBody: Buffer,
		@Body() event: unknown,
		@Headers('x-signature') signature: string,
		@Headers('x-event-name') eventName: EventName
	) {
		await this.subscriptionService.validateWebhook(rawBody, signature)

		switch (eventName) {
			case 'order_created':
				const orderEvent = event as TypeOrderEvent
				const unlimitedSubscriptionVariantId = this.config.get(
					'UNLIMITE_SUBSCRIPTION_ID'
				)
				if (
					orderEvent.data.attributes.first_order_item.variant_id.toString() ==
					unlimitedSubscriptionVariantId
				) {
					await this.subscriptionService.createUnlimiteSubscription(orderEvent)
				}

				break
			case 'subscription_created':
				await this.subscriptionService.createSubscription(event as TypeEvent)
				break
			case 'subscription_updated':
				const subscriptionEvent = event as TypeEvent
				switch (subscriptionEvent.data.attributes.status) {
					case 'active':
						await this.subscriptionService.updateSubscription(subscriptionEvent)
						break
					case 'expired':
						await this.subscriptionService.deleteSubscription(subscriptionEvent)
						break
				}
				break
			case 'subscription_payment_success':
				await this.subscriptionService.createPayment(event as TypeInvoiceEvent)
				break
			default:
				console.log(`Unhandled event type: ${eventName}`)
		}
	}
}
