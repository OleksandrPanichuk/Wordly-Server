import { generateErrorResponse } from '@/common'
import { MeaningsService } from '@/meanings/meanings.service'
import { PrismaService } from '@app/prisma'
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
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
		private readonly meaningsService: MeaningsService
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
				take: cursor ? limit + 1 : limit,
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
}
