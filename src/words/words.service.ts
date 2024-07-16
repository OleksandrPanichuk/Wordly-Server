import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable } from '@nestjs/common'
import { CreateWordInput } from './dto'

@Injectable()
export class WordsService {
	constructor(private readonly prisma: PrismaService) {}

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
