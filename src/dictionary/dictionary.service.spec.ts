import { PrismaModule } from '@app/prisma'
import { HttpModule } from '@nestjs/axios'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DictionaryService } from './dictionary.service'

describe('DictionaryService', () => {
	let service: DictionaryService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HttpModule, PrismaModule],
			providers: [DictionaryService]
		}).compile()

		service = module.get<DictionaryService>(DictionaryService)
	})

	it('should return two words', async () => {
		const words = await service.searchWords('word')
		expect(words.length).toBe(2)
	})

	it('word should be defined', async () => {
		const word = await service.getWordByName({ word: 'word' })
		expect(word).toBeDefined()
	})

	it('should throw not found error', async () => {
		await expect(
			service.getWordByName({ word: 'word not found' })
		).rejects.toThrow(NotFoundException)
	})
})
