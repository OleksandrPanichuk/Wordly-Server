import { IsEmail, IsNotEmpty, IsString, MinLength, IsStrongPassword } from 'class-validator'

export class SignInInput {
	@IsEmail({}, { message: 'Invalid email address' })
	@IsNotEmpty({ message: 'Email is required' })
	readonly email: string

	@IsString()
	@IsNotEmpty()
	@IsStrongPassword(null, { message: 'Password is too weak' })
	@MinLength(8, { message: 'Password is too short' })
	readonly password: string
}
