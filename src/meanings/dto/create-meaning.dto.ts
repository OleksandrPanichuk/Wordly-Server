import { LearnType, PartOfSpeech } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'
import { UploadedFile } from '@/common'

export class CreateMeaningInput {
	@IsNotEmpty()
	@IsString()
	readonly definition: string

	@IsEnum(LearnType)
	readonly type: LearnType

	@IsMongoId()
	readonly itemId: string

	@IsEnum(PartOfSpeech)
	readonly partOfSpeech: PartOfSpeech

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly examples?: string[]
}

export class CreateWordMeaningInput {
	@IsNotEmpty()
	@IsString()
	readonly definition: string

	@IsEnum(PartOfSpeech)
	readonly partOfSpeech: PartOfSpeech

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly examples?: string[]

	@IsMongoId()
	readonly wordId: string

	@IsOptional()
	@ValidateNested()
	readonly image?: UploadedFile
}
