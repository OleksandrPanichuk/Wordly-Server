import { Prisma } from '@prisma/client'
import {
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	MinLength
} from 'class-validator'

export class UpdateBillingInfoInput
	implements Prisma.BillingInfoUpdateWithoutUserInput
{
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsEmail()
	readonly email?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	readonly address?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly city?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly country?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	readonly firstName?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	readonly lastName?: string

	@IsOptional()
	@IsNumber()
	@IsPositive()
	readonly phoneNumber?: number

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly postalCode?: string
}
