import { Transcription } from '@/common'
import { CreateWordMeaningInput } from '@/meanings/dto'
import { Transform } from 'class-transformer'
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'

export class CreateWordInput {
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.toLowerCase())
	readonly name: string

	@ValidateNested()
	readonly transcription: Transcription

	@IsOptional()
	@ValidateNested()
	readonly meaning?: Omit<CreateWordMeaningInput, 'wordId'>
}
