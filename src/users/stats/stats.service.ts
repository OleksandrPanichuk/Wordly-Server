import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StatsService {
	constructor(private readonly prisma: PrismaService) {}

	public async getEditingStats(userId: string) {
		try {
			const { _count } = await this.prisma.user.findUnique({
				where: {
					id: userId
				},
				select: {
					_count: {
						select: {
							createdWords: true,
							createdMeanings: true,
							createdExpressions: true,
							createdLists: true,
							createdPacks: true,
							createdSets: true
						}
					}
				}
			})

			return _count
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
