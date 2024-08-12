import { IsMongoId } from "class-validator"

export class FindAllPaymentsInput {

	@IsMongoId()
	readonly userId: string
}
