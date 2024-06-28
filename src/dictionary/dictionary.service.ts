import { DICTIONARY_API_URL } from '@/constants'
import { PrismaService } from '@app/prisma'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PartOfSpeech } from '@prisma/client'
import { firstValueFrom } from 'rxjs'
import { v4 as uuid } from 'uuid'
import { GetWordByNameInput, GetWordByNameResponse } from './dictionary.dto'
import {
	TypeDictionaryNotFound,
	TypeDictionaryWord,
	TypeSearchDictionaryWord
} from './dictionary.types'

@Injectable()
export class DictionaryService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly httpService: HttpService
	) {}

	public async searchWords(query: string) {
		const usersWords = await this.prisma.word.findMany({
			where: {
				name: {
					contains: query,
					mode: 'insensitive'
				}
			},
			include: {
				meanings: {
					select: {
						definition: true,
						image: {
							select: {
								url: true
							}
						}
					},
					take: 1
				}
			}
		})

		const wordFromDictionary = await this.fetchWordFromDictionary(query)

		const words: TypeSearchDictionaryWord[] = []

		if (wordFromDictionary && Array.isArray(wordFromDictionary)) {
			words.push({
				id: uuid(),
				name: wordFromDictionary[0].word,
				meaning: wordFromDictionary[0].meanings[0].definitions[0].definition
			})
		}

		for (const word of usersWords) {
			words.push({
				id: word.id,
				name: word.name,
				meaning: word.meanings[0].definition,
				image: word.meanings[0]?.image?.url
			})
		}

		return words
	}

	public async getWordByName({
		mode = 'DICTIONARY',
		word
	}: GetWordByNameInput): Promise<GetWordByNameResponse> {
		if (mode === 'DICTIONARY') {
			const wordFromDictionary = await this.fetchWordFromDictionary(word)

			if (!('title' in wordFromDictionary)) {
				const { partsOfSpeech, examples, meanings } =
					this.extractMeaningsFromDictionary(wordFromDictionary[0])

				return {
					id: uuid(),
					name: wordFromDictionary[0].word,
					partsOfSpeech,
					type: 'DICTIONARY',
					examples,
					meanings: Object.entries(meanings).map(([key, value]) => ({
						definitions: value,
						partOfSpeech: key as PartOfSpeech
					})),
					phonetics: this.extractPhoneticsFromDictionary(wordFromDictionary[0])
				} as GetWordByNameResponse
			} else {
				throw new NotFoundException('Word not found')
			}
		}

		const wordFromDB = await this.fetchWordFromDB(word)

		if (!wordFromDB) {
			throw new NotFoundException('Word not found')
		}

		const meanings: Partial<
			Record<PartOfSpeech, GetWordByNameResponse['meanings'][0]['definitions']>
		> = {}

		const examples: string[] = []

		for (const meaning of wordFromDB.meanings) {
			const partOfSpeech = meaning.partOfSpeech
			if (meanings[partOfSpeech]?.length) {
				delete meaning.partOfSpeech
				meanings[partOfSpeech].push(meaning)
			} else {
				delete meaning.partOfSpeech
				meanings[partOfSpeech] = [meaning]
			}

			if (meaning?.examples?.length) examples.push(...meaning.examples)
		}

		return {
			id: wordFromDB.id,
			name: wordFromDB.name,
			examples,
			type: 'USER',
			partsOfSpeech: wordFromDB.partsOfSpeech,
			phonetics: wordFromDB.transcription,
			meanings: Object.entries(meanings).map(([key, value]) => ({
				definitions: value,
				partOfSpeech: key as PartOfSpeech
			}))
		}
	}

	private async fetchWordFromDictionary(
		word: string
	): Promise<TypeDictionaryWord[] | TypeDictionaryNotFound | null> {
		try {
			const { data } = await firstValueFrom(
				this.httpService.get<TypeDictionaryWord[] | TypeDictionaryNotFound>(
					DICTIONARY_API_URL + word
				)
			)

			return data
		} catch {
			return null
		}
	}

	private async fetchWordFromDB(word: string) {
		return await this.prisma.word.findFirst({
			where: {
				name: word
			},
			include: {
				meanings: {
					select: {
						definition: true,
						examples: true,
						id: true,
						image: {
							select: {
								url: true
							}
						},
						partOfSpeech: true
					}
				}
			}
		})
	}

	private extractMeaningsFromDictionary(
		wordFromDictionary: TypeDictionaryWord
	): {
		partsOfSpeech: PartOfSpeech[]
		examples: string[]
		meanings: Partial<
			Record<PartOfSpeech, GetWordByNameResponse['meanings'][0]['definitions']>
		>
	} {
		const partsOfSpeech: PartOfSpeech[] = []
		const examples: string[] = []
		const meanings: Partial<
			Record<PartOfSpeech, GetWordByNameResponse['meanings'][0]['definitions']>
		> = {}

		for (const meaning of wordFromDictionary.meanings) {
			const partOfSpeech = meaning.partOfSpeech.toUpperCase() as PartOfSpeech
			if (!partsOfSpeech.includes(partOfSpeech)) {
				partsOfSpeech.push(partOfSpeech)
			}

			for (const item of meaning.definitions) {
				const extractedExamples = this.extractExamplesFromDictionary(
					item?.example ?? '',
					wordFromDictionary.word
				)
				if (meanings[partOfSpeech]?.length) {
					meanings[partOfSpeech].push({
						definition: item.definition,
						id: uuid(),
						...(!!item.example && { examples: extractedExamples })
					})
				} else {
					meanings[partOfSpeech] = [
						{
							definition: item.definition,
							id: uuid(),
							...(!!item.example && { examples: extractedExamples })
						}
					]
				}
				if (item.example) {
					examples.concat(extractedExamples)
				}
			}
		}

		return { partsOfSpeech, examples, meanings }
	}

	private extractExamplesFromDictionary(
		example: string,
		word: string
	): string[] {
		const result: string[] = []

		const regex = new RegExp(`^${word}(s|ed)?(?![a-zA-Z])`, 'i')

		const sentences = this.extractSentences(example)

		sentences.forEach((sentence) => {
			const words = this.splitSentence(sentence)

			for (const el of words) {
				const isSearchedWord = regex.test(el)

				if (isSearchedWord) {
					result.push(sentence)
					break
				}
			}
		})

		return result
	}

	private extractSentences(text: string): string[] {
		const sentencePattern = /[^.!?]*[.!?]/g
		const sentences = text.match(sentencePattern)
		return sentences ? sentences.map((sentence) => sentence.trim()) : []
	}
	private splitSentence(sentence: string): (string)[] {
		const wordPattern = /[\w\u0400-\u04FF]+|[.,!?]/g
		const words = sentence.match(wordPattern)
		return words ? words : []
	}

	private extractPhoneticsFromDictionary(
		wordFromDictionary: TypeDictionaryWord
	): {
		audio?: string
		general?: string
	} {
		const audio =
			wordFromDictionary.phonetics.find((el) => !!el.audio && !!el.text)
				?.audio || wordFromDictionary.phonetics.find((el) => !!el.audio)?.audio
		const general =
			wordFromDictionary.phonetic ||
			wordFromDictionary.phonetics.find((el) => !!el.audio && !!el.text)
				?.text ||
			wordFromDictionary.phonetics.find((el) => !!el.text)?.text
		return { audio, general }
	}
}
