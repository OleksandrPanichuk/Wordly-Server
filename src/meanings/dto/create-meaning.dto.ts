import { LearnType, PartOfSpeech } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString
} from 'class-validator'

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
