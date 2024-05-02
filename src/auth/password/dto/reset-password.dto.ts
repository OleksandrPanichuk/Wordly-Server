import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResetPasswordInput {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string
}
