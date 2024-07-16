import { Transcription } from '@/common'
import { PartOfSpeech, Prisma } from '@prisma/client'
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class CreateWordInput implements Prisma.WordUncheckedCreateInput {
	@IsNotEmpty()
	@IsString()
	readonly name: string

	@ValidateNested()
	readonly transcription: Transcription

	@IsArray()
	@IsEnum(PartOfSpeech, { each: true })
	readonly partsOfSpeech?: PartOfSpeech[]
}
