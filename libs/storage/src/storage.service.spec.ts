import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from './storage.service'

describe('StorageService', () => {
	let storageService: StorageService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [StorageService, ConfigService]
		}).compile()

		storageService = module.get<StorageService>(StorageService)
	})

	it('should be defined', () => {
		expect(storageService).toBeDefined()
	})

	it('should upload a file', async () => {
		const file = { buffer: 'mock-buffer' }
		const uploadedFile = await storageService.upload(file as any)
		expect(uploadedFile).toHaveProperty('key')
		expect(uploadedFile).toHaveProperty('url')
	})

	it('should delete a file', async () => {
		const key = 'mocked-key'
		await expect(storageService.delete(key)).resolves.not.toThrow()
	})
})
