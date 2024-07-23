import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CreateBillingInfoInput, UpdateBillingInfoInput } from './dto'
import { BillingInfo } from '@prisma/client'

@Injectable()
export class BillingInfoService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	public async get(userId: string) {
		try {
			const cachedBillingInfo = await this.cache.get<BillingInfo>(`billing-info:${userId}`)

			if (cachedBillingInfo) {
				return cachedBillingInfo
			}


			const billingInfo = await this.prisma.billingInfo.findUnique({
				where: {
					userId
				}
			})

			if (!billingInfo) {
				throw new NotFoundException('Billing information is not found')
			}

			await this.cache.set(`billing-info:${userId}`, billingInfo)

			return billingInfo
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async create(dto: CreateBillingInfoInput, userId: string) {
		try {
			const billingInfo = await this.prisma.billingInfo.findUnique({
				where: {
					userId
				}
			})

			if (billingInfo) {
				throw new ConflictException('You already have billing info.')
			}

			return await this.prisma.billingInfo.create({
				data: {
					...dto,
					userId
				}
			})
		} catch (err) {
			console.log(err)
			throw generateErrorResponse(err)
		}
	}

	public async update(id: string, dto: UpdateBillingInfoInput, userId: string) {
		try {
			const billingInfo = await this.prisma.billingInfo.findUnique({
				where: { id }
			})

			if (!billingInfo) {
				throw new NotFoundException("User doesn't have billing info")
			}

			if (billingInfo.userId !== userId) {
				throw new ForbiddenException(
					'You cannot update billing info of other users'
				)
			}

			await this.cache.del(`billing-info:${userId}`)

			return await this.prisma.billingInfo.update({
				where: {
					id,
					userId
				},
				data: dto
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
