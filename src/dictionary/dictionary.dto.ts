import { PartOfSpeech } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString
} from 'class-validator'

export class SearchInput {
	@IsString()
	@IsNotEmpty()
	readonly q: string

	@IsOptional()
	@Transform(({ value }) => value && parseInt(value))
	@IsNumber()
	@IsPositive()
	readonly take?: number

	@IsOptional()
	@IsMongoId()
	readonly cursor?: string
}

export class GetWordByNameInput {
	@IsString()
	@IsNotEmpty()
	readonly word: string
}

export type GetWordByNameResponse = {
	id: string
	name: string
	examples?: string[]
	partsOfSpeech: PartOfSpeech[]

	phonetics: {
		en?: string
		us?: string
		general?: string
		audio?: string
	}

	meanings: {
		definitions: {
			definition: string
			examples: string[]
			id: string
			image?: {
				url: string
			}
		}[]
		partOfSpeech: PartOfSpeech
	}[]
}
