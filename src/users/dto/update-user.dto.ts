import { UploadedFile } from '@/common'
import { Gender, Prisma } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'

export class UpdateUserInput implements Prisma.UserUpdateInput {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	readonly username?: string

	@IsOptional()
	@IsEnum(Gender)
	readonly gender?: Gender

	@IsOptional()
	@IsNotEmpty({ each: true })
	@IsString({ each: true })
	@IsArray()
	readonly nativeLanguage?: string[]

	@IsOptional()
	@ValidateNested()
	readonly avatar?: UploadedFile
}
