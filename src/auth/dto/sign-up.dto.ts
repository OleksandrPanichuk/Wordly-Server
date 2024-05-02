import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsStrongPassword,
	IsUrl,
	MinLength
} from 'class-validator'

export class SignUpInput {
	@IsEmail()
	@IsNotEmpty()
	readonly email: string

	@IsNotEmpty()
	@IsString()
	@IsStrongPassword(null, { message: 'Password is too weak' })
	@MinLength(8, { message: 'The password must be at least 8 characters long' })
	readonly password: string

	@IsNotEmpty()
	@IsString()
	readonly username: string

	@IsNotEmpty()
	@IsString()
	@IsUrl()
	@IsOptional()
	readonly avatarUrl?: string
}
