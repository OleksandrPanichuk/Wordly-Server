import { PrismaService } from '@app/prisma'
import { WordsDictionaryService } from '@app/words-dictionary'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PartOfSpeech, Prisma, UserRole } from '@prisma/client'
import { v4 as uuid } from 'uuid'
import {
	GetWordByNameInput,
	GetWordByNameResponse,
	SearchInput
} from './dictionary.dto'
import { TypeSearchDictionaryWord } from './dictionary.types'

@Injectable()
export class DictionaryService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly wordsDictionary: WordsDictionaryService
	) {}

	// TODO: also search for expressions that contain this query
	public async search(input: SearchInput) {
		const { q, cursor, take } = input

		const wordFromDictionary = await this.wordsDictionary.fetch(q)

		const limit = take ?? (Array.isArray(wordFromDictionary) ? 39 : 40)

		const usersWords = await this.prisma.word.findMany({
			where: {
				name: {
					contains: q,
					mode: 'insensitive'
				}
			},
			take: cursor ? limit + 1 : limit,
			cursor: cursor
				? {
						id: cursor
					}
				: undefined,
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

		let nextCursor: typeof cursor | undefined = undefined

		if (usersWords.length > limit) {
			const nextItem = usersWords.pop()
			nextCursor = nextItem!.id
		}

		const words: TypeSearchDictionaryWord[] = []

		if (wordFromDictionary && Array.isArray(wordFromDictionary)) {
			words.push({
				id: uuid(),
				name: wordFromDictionary[0].word,
				meaning: wordFromDictionary[0].meanings[0].definitions[0].definition
			})
		}

		for (const word of usersWords) {
			if (words.some((el) => el.name === word.name)) {
				continue
			}
			words.push({
				id: word.id,
				name: word.name,
				meaning: word.meanings[0].definition,
				image: word.meanings[0]?.image?.url
			})
		}

		return {
			words,
			nextCursor
		}
	}

	public async getWordByName({
		word
	}: GetWordByNameInput): Promise<GetWordByNameResponse> {
		const wordFromDB = await this.fetchWordFromDB(word)

		if (!wordFromDB) {
			return await this.fetchWordFromDictionaryAndCreate(word)
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
			partsOfSpeech: wordFromDB.partsOfSpeech,
			phonetics: wordFromDB.transcription,
			meanings: Object.entries(meanings).map(([key, value]) => ({
				definitions: value,
				partOfSpeech: key as PartOfSpeech
			}))
		}
	}

	private async fetchWordFromDictionaryAndCreate(
		word: string
	): Promise<GetWordByNameResponse> {
		const wordFromDictionary = await this.wordsDictionary.fetch(word)

		if (!wordFromDictionary || 'title' in wordFromDictionary) {
			throw new NotFoundException('Word not found')
		}

		const admin = await this.prisma.user.findFirst({
			where: {
				role: UserRole.ADMIN
			}
		})!

		const { partsOfSpeech, examples, meanings } =
			this.wordsDictionary.extractMeanings(wordFromDictionary[0])
		const transcription = this.wordsDictionary.extractPhonetics(
			wordFromDictionary[0]
		)

		await this.prisma.word.create({
			data: {
				name: word.toLowerCase(),
				transcription: {
					en: transcription.general
				},
				creatorId: admin.id,
				partsOfSpeech,
				meanings: {
					createMany: {
						data: Object.entries(meanings)
							.map(([key, value]) =>
								value.map(
									(el) =>
										({
											definition: el.definition,
											partOfSpeech: key as PartOfSpeech,
											examples: el.examples,
											image: el.image,
											creatorId: admin.id
										}) as Prisma.MeaningsCreateManyWordInput
								)
							)
							.flat()
					}
				}
			}
		})

		return {
			id: uuid(),
			name: wordFromDictionary[0].word,
			partsOfSpeech,
			examples,
			meanings: Object.entries(meanings).map(([key, value]) => ({
				definitions: value,
				partOfSpeech: key as PartOfSpeech
			})),
			phonetics: transcription
		}
	}

	private async fetchWordFromDB(word: string) {
		return await this.prisma.word.findFirst({
			where: {
				name: {
					equals: word,
					mode: 'insensitive'
				}
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
}
