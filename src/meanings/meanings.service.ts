import { generateErrorResponse } from '@/common'
import { SubscriptionService } from '@/subscription/subscription.service'
import { CloudinaryService } from '@app/cloudinary'
import { PrismaService } from '@app/prisma'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import {
	LearnType,
	Meanings,
	PartOfSpeech,
	Prisma,
	User,
	UserRole
} from '@prisma/client'
import { Cache } from 'cache-manager'
import {
	CreateMeaningInput,
	CreateWordMeaningInput,
	FindAllMeaningsInput,
	UpdateMeaningInput
} from './dto'

@Injectable()
export class MeaningsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		private readonly subscriptionService: SubscriptionService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async findAll(dto: FindAllMeaningsInput) {
		try {
			const cacheKey = 'meanings:' + JSON.stringify(dto)

			const meaningsFromCache: Meanings[] = await this.cache.get(cacheKey)

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

			await this.cache.store.set(cacheKey, meanings)

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

			await this.updatePartsOfSpeech(itemId, dto.partOfSpeech, dto.type)

			return await this.prisma.meanings.create({
				data
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async createWordMeaning(dto: CreateWordMeaningInput, userId?: string) {
		await this.updatePartsOfSpeech(
			dto.wordId,
			dto.partOfSpeech,
			LearnType.VOCABULARY
		)
		return await this.prisma.meanings.create({
			data: {
				...dto,
				creatorId: userId
			}
		})
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

			if (!isAdmin) {
				const isSubscribed = await this.subscriptionService.checkIfSubscribed(
					user.id
				)
				if (!isSubscribed) {
					throw new ForbiddenException(
						'Only subscribed users allowed to update meanings'
					)
				}
			}

			const uploadedImage = await this.cloudinary.upload(image)

			if (meaning.image) {
				await this.cloudinary.delete(meaning.image.key)
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
					creatorId: true
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
			const meaning = await this.prisma.meanings.findUnique({
				where: {
					id: meaningId,
					creatorId: userId
				}
			})

			if (!meaning) {
				throw new NotFoundException('Meaning not found')
			}

			await this.prisma.meanings.delete({
				where: {
					id: meaningId,
					creatorId: userId
				}
			})

			if (meaning?.image?.key) {
				await this.cloudinary.delete(meaning.image.key)
			}

			await this.clearCachedMeanings()

			await this.revalidatePartsOfSpeech(
				meaning.wordId,
				meaning.partOfSpeech,
				meaning.type
			)

			return 'Deleted successfully'
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async deleteMany(meaningIds: string[], user: User) {
		try {
			const meanings = await this.prisma.meanings.findMany({
				where: {
					id: {
						in: meaningIds
					}
				}
			})

			await Promise.all(
				meanings.map(async (meaning) => {
					await this.prisma.meanings.delete({
						where: {
							id: meaning.id,
							creatorId: user.role === UserRole.ADMIN ? undefined : user.id
						}
					})
					if (meaning?.image?.key) {
						await this.cloudinary.delete(meaning.image.key)
					}

					await this.clearCachedMeanings()

					await this.revalidatePartsOfSpeech(
						meaning.wordId,
						meaning.partOfSpeech,
						meaning.type
					)
				})
			)
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	private async clearCachedMeanings() {
		const keys: string[] = await this.cache.store.keys()
		const cachedMeaningsKeys = keys.filter((key) => key.startsWith('meanings'))

		if (cachedMeaningsKeys.length) {
			await this.cache.store.del(...cachedMeaningsKeys)
		}
	}

	private async updatePartsOfSpeech(
		id: string,
		partOfSpeech: PartOfSpeech,
		type: LearnType
	) {
		let item: { partsOfSpeech: PartOfSpeech[] }
		switch (type) {
			case LearnType.VOCABULARY: {
				item = await this.prisma.word.findUnique({
					where: { id }
				})
				break
			}
			case LearnType.EXPRESSIONS: {
				item = await this.prisma.expression.findUnique({
					where: { id }
				})
				break
			}
		}

		if (!item) {
			throw new NotFoundException('Word not found')
		}

		if (item.partsOfSpeech.includes(partOfSpeech)) {
			return
		}

		switch (type) {
			case LearnType.VOCABULARY: {
				await this.prisma.word.update({
					where: {
						id
					},
					data: {
						partsOfSpeech: [...item.partsOfSpeech, partOfSpeech]
					}
				})
				break
			}
			case LearnType.EXPRESSIONS: {
				await this.prisma.expression.update({
					where: {
						id
					},
					data: {
						partsOfSpeech: [...item.partsOfSpeech, partOfSpeech]
					}
				})
				break
			}
			default: {
				throw new Error('Invalid type')
			}
		}
	}

	private async revalidatePartsOfSpeech(
		id: string,
		partOfSpeech: PartOfSpeech,
		type: LearnType
	) {
		const allMeanings = await this.prisma.meanings.findMany({
			where: {
				type,
				...(type === LearnType.VOCABULARY
					? { wordId: id }
					: { expressionId: id })
			}
		})

		const partsOfSpeech = Array.from(
			new Set(allMeanings.map((meaning) => meaning.partOfSpeech))
		)

		if (partsOfSpeech.includes(partOfSpeech)) {
			return
		}

		switch (type) {
			case LearnType.VOCABULARY: {
				const word = await this.prisma.word.update({
					where: {
						id
					},
					data: {
						partsOfSpeech
					}
				})

				await this.cache.del('word-by-id:' + id)
				await this.cache.del('word-by-name:' + word.name)

				break
			}
			case LearnType.EXPRESSIONS: {
				await this.prisma.expression.update({
					where: {
						id
					},
					data: {
						partsOfSpeech
					}
				})

				// TODO: delete cached expressions
				break
			}
			default: {
				throw new Error('Invalid type')
			}
		}
	}
}
