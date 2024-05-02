import {
	IsNotEmpty,
	IsString,
	IsStrongPassword,
	IsUUID,
	MinLength
} from 'class-validator'

export class UpdatePasswordInput {
	@IsUUID(4, { message: 'Invalid code' })
	readonly code: string

	@IsNotEmpty()
	@IsString()
	@IsStrongPassword(null, { message: 'Password is too weak' })
	@MinLength(8, { message: 'The password must be at least 8 characters long' })
	readonly password: string
}
