import { LearnType, PartOfSpeech } from '@prisma/client'
import { IsEnum, IsMongoId, IsOptional } from 'class-validator'

export class FindAllMeaningsInput {
	@IsOptional()
	@IsEnum(PartOfSpeech)
	readonly partOfSpeech?: PartOfSpeech

	@IsEnum(LearnType)
	readonly learnType: LearnType


	@IsMongoId()
	readonly itemId: string
}
