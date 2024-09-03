import { generateErrorResponse } from '@/common'
import { MeaningsService } from '@/meanings/meanings.service'
import { PrismaService } from '@app/prisma'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Prisma, User, UserRole, Word } from '@prisma/client'
import { Cache } from 'cache-manager'
import {
	CreateWordInput,
	FindManyWordsInput,
	FindManyWordsResponse,
	FindWordByNameInput,
	SortBy
} from './dto'

@Injectable()
export class WordsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly meaningsService: MeaningsService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async findMany(
		dto: FindManyWordsInput
	): Promise<FindManyWordsResponse> {
		try {
			const { cursor, take, sortBy, sortOrder, creatorId, searchValue } = dto
			const limit = take ?? 10

			let orderBy!: Prisma.WordFindManyArgs['orderBy']
			const whereCondition: Prisma.WordWhereInput = {
				creatorId,
				name: {
					contains: searchValue,
					mode: 'insensitive'
				}
			}

			switch (sortBy) {
				case SortBy.NAME:
					orderBy = {
						name: sortOrder
					}
					break
				case SortBy.CREATED_AT:
					orderBy = {
						createdAt: sortOrder
					}
					break
				case SortBy.MEANINGS_COUNT:
					orderBy = {
						meanings: {
							_count: sortOrder
						}
					}
					break
				default:
					orderBy = {
						createdAt: sortOrder
					}
			}

			const words = await this.prisma.word.findMany({
				where: whereCondition,
				cursor: cursor
					? {
							id: cursor
						}
					: undefined,
				take: limit + 1,
				orderBy,
				include: {
					_count: {
						select: {
							meanings: true
						}
					}
				}
			})

			const count = await this.prisma.word.count({
				where: whereCondition
			})

			let nextCursor: typeof cursor | undefined = undefined

			if (words.length > limit) {
				const nextItem = words.pop()
				nextCursor = nextItem!.id
			}

			return {
				count,
				nextCursor,
				words
			}
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async findByName({ name }: FindWordByNameInput) {
		try {
			const cachedWord = await this.cache.get<Word>(`word-by-name:${name}`)

			if (cachedWord) {
				return cachedWord
			}

			const word = await this.prisma.word.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive'
					}
				}
			})

			if (!word) {
				throw new NotFoundException()
			}

			await this.cache.set(`word-by-name:${name}`, word)

			return word
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async create({ meaning, ...dto }: CreateWordInput, userId?: string) {
		try {
			const existingWord = await this.prisma.word.findFirst({
				where: {
					name: {
						equals: dto.name,
						mode: 'insensitive'
					}
				}
			})

			if (existingWord) {
				throw new ConflictException('Word with this name already exists')
			}

			const word = await this.prisma.word.create({
				data: {
					...dto,
					creatorId: userId,
					partsOfSpeech: []
				}
			})

			if (meaning) {
				await this.meaningsService.createWordMeaning(
					{
						...meaning,
						wordId: word.id
					},
					userId
				)
			}

			return word
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async delete(wordId: string, user: User) {
		try {
			const word = await this.prisma.word.findFirst({
				where: {
					id: wordId
				},
				include: {
					meanings: true
				}
			})

			if (!word) {
				throw new NotFoundException('Word not found')
			}

			if (user.role !== UserRole.ADMIN && word.creatorId !== user.id) {
				throw new ForbiddenException('You cannot delete this word')
			}

			await this.meaningsService.deleteMany(
				word.meanings.map((m) => m.id),
				user
			)

			await this.prisma.word.delete({
				where: {
					id: wordId
				}
			})

			await this.cache.del(`word-by-name:${word.name}`)
			await this.cache.del(`word-by-id:${word.id}`)

			return word
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
