import { IsMongoId } from 'class-validator'

export class FindWordByIdInput {
	@IsMongoId()
	readonly id: string
}
