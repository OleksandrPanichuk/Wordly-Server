import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class SubscribeInput {
	@IsString()
	@IsNotEmpty()
	readonly productId: string
}


export class GetSubscriptionInput {
	@IsString()
	@IsMongoId()
	readonly userId: string
}