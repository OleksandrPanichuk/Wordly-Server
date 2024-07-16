import { generateErrorResponse } from '@/common'
import { SubscriptionService } from '@/subscription/subscription.service'
import { PrismaService } from '@app/prisma'
import { StorageService } from '@app/storage'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { LearnType, Meanings, Prisma, User, UserRole } from '@prisma/client'
import { Cache } from 'cache-manager'
import { CreateMeaningInput, GetMeaningsInput, UpdateMeaningInput } from './dto'

@Injectable()
export class MeaningsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly storage: StorageService,
		private readonly subscriptionService: SubscriptionService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async get(dto: GetMeaningsInput) {
		try {
			const meaningsFromCache: Meanings[] = await this.cache.get(
				'meanings:' + JSON.stringify(dto)
			)

			if (meaningsFromCache) {
				return meaningsFromCache
			}

			const whereCondition: Prisma.MeaningsFindManyArgs['where'] = {
				type: dto.learnType,
				partOfSpeech: dto.partOfSpeech
			}

			switch (dto.learnType) {
				case LearnType.EXPRESSIONS: {
					whereCondition['expressionId'] = dto.itemId
					break
				}
				case LearnType.VOCABULARY: {
					whereCondition['wordId'] = dto.itemId
					break
				}
			}

			const meanings = await this.prisma.meanings.findMany({
				where: whereCondition
			})

			await this.cache.store.set('meanings:' + JSON.stringify(dto), meanings)

			return meanings
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async create({ itemId, ...dto }: CreateMeaningInput, userId?: string) {
		try {
			const data: Prisma.MeaningsCreateArgs['data'] = {
				creatorId: userId,
				...dto
			}

			switch (dto.type) {
				case LearnType.VOCABULARY: {
					data['wordId'] = itemId
					break
				}
				case LearnType.EXPRESSIONS: {
					data['expressionId'] = itemId
					break
				}
			}

			await this.clearCachedMeanings()

			return await this.prisma.meanings.create({
				data
			})
		} catch (err) {
			console.log('ERROR', err)
			throw generateErrorResponse(err)
		}
	}

	public async updateMeaningImage(
		id: string,
		image: Express.Multer.File,
		user: User
	) {
		try {
			const isAdmin = user.role === UserRole.ADMIN
			const meaning = await this.prisma.meanings.findUnique({
				where: {
					id
				},
				select: {
					creatorId: true,
					image: true
				}
			})

			if (!meaning) {
				throw new NotFoundException('Meaning not found')
			}

			if (!isAdmin && user.id !== meaning.creatorId) {
				throw new ForbiddenException('Not allowed to update this meaning')
			}

			const isSubscribed = await this.subscriptionService.checkIsSubscribed(
				user.id
			)

			if (!isAdmin && !isSubscribed) {
				throw new ForbiddenException(
					'Only subscribed users allowed to update meanings'
				)
			}

			const uploadedImage = await this.storage.upload(image)

			if (meaning.image) {
				await this.storage.delete(meaning.image.key)
			}

			const updatedMeaning = await this.prisma.meanings.update({
				where: {
					id
				},
				data: {
					image: uploadedImage
				}
			})

			await this.clearCachedMeanings()

			return updatedMeaning
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async update(id: string, dto: UpdateMeaningInput, user: User) {
		try {
			const meaning = await this.prisma.meanings.findUnique({
				where: { id },
				select: {
					creatorId:true
				}
			})

			if (!meaning) {
				throw new NotFoundException('Meaning not found')
			}
			if (user.role !== UserRole.ADMIN && user.id !== meaning.creatorId) {
				throw new ForbiddenException('Not allowed to update this meaning')
			}

			const updatedMeaning = await this.prisma.meanings.update({
				where: {
					id
				},
				data: dto
			})

			await this.clearCachedMeanings()

			return updatedMeaning
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async delete(meaningId: string, userId?: string) {
		try {
			const meaning = await this.prisma.meanings.delete({
				where: {
					id: meaningId,
					creatorId: userId
				}
			})

			await this.storage.delete(meaning.image.key)

			await this.clearCachedMeanings()

			return 'Deleted successfully'
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	private async clearCachedMeanings() {
		const keys = await this.cache.store.keys()
		const cachedMeaningsKeys = keys.filter((key) => key.startsWith('meanings'))

		if (cachedMeaningsKeys.length) {
			await this.cache.store.del(...cachedMeaningsKeys)
		}
	}
}
