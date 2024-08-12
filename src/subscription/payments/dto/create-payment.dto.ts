import { BillingReason } from '@prisma/client'
import { IsEnum, IsMongoId, IsNumber, IsPositive, IsUrl } from 'class-validator'

export class CreatePaymentInput {
	@IsNumber()
	@IsPositive()
	readonly subtotal: number

	@IsNumber()
	@IsPositive()
	readonly tax: number

	@IsNumber()
	@IsPositive()
	readonly total: number

	@IsEnum(BillingReason)
	readonly billingReason: BillingReason

	@IsMongoId()
	readonly subscriptionId: string

	@IsMongoId()
	readonly userId: string

	readonly lsSubscriptionId: string

}
