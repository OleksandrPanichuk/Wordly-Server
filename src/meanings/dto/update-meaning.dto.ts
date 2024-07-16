import { PartOfSpeech } from '@prisma/client'
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString
} from 'class-validator'

export class UpdateMeaningInput {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly definition?: string

	@IsOptional()
	@IsEnum(PartOfSpeech)
	readonly partOfSpeech?: PartOfSpeech

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly examples?: string[]
}
