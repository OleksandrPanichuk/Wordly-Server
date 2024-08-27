import { IsNotEmpty, IsString } from 'class-validator'

export class FindWordByNameInput {
	@IsNotEmpty()
	@IsString()
	readonly name: string
}
