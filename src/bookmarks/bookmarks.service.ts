import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable } from '@nestjs/common'
import { BookmarkType } from '@prisma/client'
import { CreateBookmarkInput, GetAllBookmarksInput } from './dto'

@Injectable()
export class BookmarksService {
	constructor(private readonly prisma: PrismaService) {}

	public async getAll(dto: GetAllBookmarksInput, userId: string) {
		try {
			return await this.prisma.bookmarks.findMany({
				where: {
					userId,
					type: dto.type
				},
				take: dto.take,
				skip: dto.skip
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async create(dto: CreateBookmarkInput, userId: string) {
		try {
			switch (dto.type) {
				case BookmarkType.WORD: {
					return await this.prisma.bookmarks.create({
						data: {
							wordId: dto.itemId,
							type: dto.type,
							userId
						}
					})
				}
				case BookmarkType.SET: {
					return await this.prisma.bookmarks.create({
						data: {
							setId: dto.itemId,
							type: dto.type,
							userId
						}
					})
				}
				case BookmarkType.PACK: {
					return await this.prisma.bookmarks.create({
						data: {
							type: dto.type,
							packId: dto.itemId,
							userId
						}
					})
				}
				case BookmarkType.LIST: {
					return await this.prisma.bookmarks.create({
						data: {
							type: dto.type,
							listId: dto.itemId,
							userId
						}
					})
				}
			}
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async delete(bookmarkId: string, userId: string) {
		try {
			return await this.prisma.bookmarks.delete({
				where: {
					id: bookmarkId,
					userId
				}
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
