import { Prisma } from '@prisma/client'
import {
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	MinLength
} from 'class-validator'

export class CreateBillingInfoInput
	implements Prisma.BillingInfoCreateWithoutUserInput
{
	@IsNotEmpty()
	@IsString()
	@MinLength(5)
	readonly address: string

	@IsNotEmpty()
	@IsString()
	readonly city: string

	@IsNotEmpty()
	@IsString()
	readonly country: string

	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	readonly firstName: string


	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	readonly lastName: string

	@IsNumber()
	@IsPositive()
	readonly phoneNumber: number

	@IsNotEmpty()
	@IsString()
	readonly postalCode: string
}
