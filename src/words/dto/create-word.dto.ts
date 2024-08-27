import { Transcription } from '@/common'
import { CreateWordMeaningInput } from '@/meanings/dto'
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'

export class CreateWordInput {
	@IsNotEmpty()
	@IsString()
	readonly name: string

	@ValidateNested()
	readonly transcription: Transcription

	@IsOptional()
	@ValidateNested()
	readonly meaning?: Omit<CreateWordMeaningInput, 'wordId'>
}
