import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}
	public async findById(userId: string): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId
				}
			})

			if (!user)
				throw new NotFoundException('User not found', {
					description: 'user/user-not-found'
				})
			return user
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
