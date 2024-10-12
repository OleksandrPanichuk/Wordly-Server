export type TypeDictionaryWord = {
	image?: string
	word: string
	phonetic?: string
	phonetics?: {
		text: string
		audio?: string
		sourceUrl?: string
		license?: {
			name: string
			url: string
		}
	}[]
	meanings: {
		partOfSpeech: string
		definitions: {
			definition: string
			synonyms?: string[]
			antonyms?: string[]
			example?: string
		}[]
		synonyms?: string[]
		antonyms?: string[]
	}[]

	license?: { name: string; url: string }
	sourceUrls?: string[]
}

export type TypeDictionaryNotFound = {
	title: string
	message: string
	resolution: string
}

export type TypeDictionaryMeaning = {
	definition: string
	examples: string[]
	id: string
	image?: {
		url: string
	}
}
