import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { omit } from 'lodash'
import { UpdateUserInput } from './dto'
import { UserWithoutHash } from './users.types'
import { User } from '@prisma/client'
import { CloudinaryService } from '@app/cloudinary'

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async findById(userId: string): Promise<UserWithoutHash> {
		try {
			const cachedUser = await this.cache.get<UserWithoutHash>(`user:${userId}`)

			if (cachedUser) {
				return cachedUser
			}

			const user = await this.prisma.user.findUnique({
				where: {
					id: userId
				}
			})

			if (!user)
				throw new NotFoundException('User not found', {
					description: 'user/user-not-found'
				})

			await this.cache.set(`user:${userId}`, omit(user, 'hash'))

			return omit(user, 'hash')
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async update(dto: UpdateUserInput, userId: string) {
		try {
			const user = await this.prisma.user.update({
				where: {
					id: userId
				},
				data: {
					...dto
				}
			})

			await this.cache.del(`user:${userId}`)

			return omit(user, 'hash')
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}


	public async delete(user: User) {
		try {
			await this.prisma.user.delete({
				where: {
					id: user.id
				}
			})

			await this.cache.del(`user:${user.id}`)

			if(user.avatar.key) {
				await this.cloudinary.delete(user.avatar.key)
			}
		} catch (err) {
			throw generateErrorResponse(err) 	
		}
	}
}
