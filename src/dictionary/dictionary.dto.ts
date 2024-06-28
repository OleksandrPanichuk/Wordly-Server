import { PartOfSpeech } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class GetWordByNameInput {
	@IsOptional()
	@IsEnum(['USER', 'DICTIONARY'])
	readonly mode?: 'USER' | 'DICTIONARY'

	@IsString()
	@IsNotEmpty()
	readonly word: string
}

export type GetWordByNameResponse = {
	id: string
	type: 'DICTIONARY' | 'USER'
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
