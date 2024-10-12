import { DICTIONARY_API_URL } from '@/common'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { PartOfSpeech } from '@prisma/client'
import { firstValueFrom } from 'rxjs'
import {
	TypeDictionaryMeaning,
	TypeDictionaryNotFound,
	TypeDictionaryWord
} from './words-dictionary.types'

import { v4 as uuid } from 'uuid'

// This is service which should help to interact with free dictionary: format and extract data from it
@Injectable()
export class WordsDictionaryService {

	constructor(private readonly httpService: HttpService) {}

	public async fetch(
		word: string
	): Promise<TypeDictionaryNotFound | TypeDictionaryWord[] | null> {
		try {
			const { data } = await firstValueFrom(
				this.httpService.get<TypeDictionaryWord[] | TypeDictionaryNotFound>(
					DICTIONARY_API_URL + word
				)
			)

			return data
		} catch(err) {
			return null
		}
	}

	public extractMeanings(wordFromDictionary: TypeDictionaryWord): {
		partsOfSpeech: PartOfSpeech[]
		examples: string[]
		meanings: Partial<Record<PartOfSpeech, TypeDictionaryMeaning[]>>
	} {
		const partsOfSpeech: PartOfSpeech[] = []
		const examples: string[] = []
		const meanings: Partial<Record<PartOfSpeech, TypeDictionaryMeaning[]>> = {}

		for (const meaning of wordFromDictionary.meanings) {
			const partOfSpeech = meaning.partOfSpeech.toUpperCase() as PartOfSpeech
			if (!partsOfSpeech.includes(partOfSpeech)) {
				partsOfSpeech.push(partOfSpeech)
			}

			for (const item of meaning.definitions) {
				const extractedExamples = this.extractExamples(
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
					examples.push(...extractedExamples)
				}
			}
		}

		return { partsOfSpeech, examples, meanings }
	}

	public extractExamples(example: string, word: string): string[] {
		const result: string[] = []

		const regex = new RegExp(`^${word}(s|ed)?(?![a-zA-Z])`, 'i')

		const sentences = this.extractSentences(example)

		for (const sentence of sentences) {
			const words = this.splitSentence(sentence)

			if (words.length < 5) continue

			for (const el of words) {
				const isSearchedWord = regex.test(el)

				if (isSearchedWord) {
					result.push(sentence)
					break
				}
			}
		}

		return result
	}

	public extractPhonetics(wordFromDictionary: TypeDictionaryWord): {
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

	private extractSentences(text: string): string[] {
		const sentencePattern = /[^.!?]*[.!?]/g
		const sentences = text.match(sentencePattern)
		return sentences ? sentences.map((sentence) => sentence.trim()) : []
	}
	private splitSentence(sentence: string): string[] {
		const wordPattern = /[\w\u0400-\u04FF]+|[.,!?]/g
		const words = sentence.match(wordPattern)
		return words ? words : []
	}
}
