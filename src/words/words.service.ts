import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
	CreateWordInput,
	FindManyWordsInput,
	FindManyWordsResponse,
	SortBy
} from './dto'

@Injectable()
export class WordsService {
	constructor(private readonly prisma: PrismaService) {}

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

	public async create(dto: CreateWordInput, userId?: string) {
		try {
			return await this.prisma.word.create({
				data: {
					...dto,
					creatorId: userId
				}
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
