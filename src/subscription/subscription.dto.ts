import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class SubscribeInput {
	@IsString()
	@IsNotEmpty()
	productId: string
}


export class GetSubscriptionInput {
	@IsString()
	@IsMongoId()
	userId: string
}