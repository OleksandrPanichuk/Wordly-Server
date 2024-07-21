import { IsMongoId, IsNumber, IsPositive, IsString, Length } from 'class-validator'

export class SubscribeInput {
	@IsNumber()
	@IsPositive()
	@Length(5)
	readonly productId: number
}


export class GetSubscriptionInput {
	@IsString()
	@IsMongoId()
	readonly userId: string
}