import { IsMongoId, IsNumber, IsPositive, IsString } from 'class-validator'

export class SubscribeInput {
	@IsNumber()
	@IsPositive()
	readonly productId: number
}


export class GetSubscriptionInput {
	@IsString()
	@IsMongoId()
	readonly userId: string
}