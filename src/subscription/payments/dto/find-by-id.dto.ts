import { IsMongoId } from "class-validator"

export class FindByIdInput {
	@IsMongoId()
	readonly userId: string

	@IsMongoId()
	readonly paymentId: string
}