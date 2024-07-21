import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateBillingInfoInput, UpdateBillingInfoInput } from './dto'

@Injectable()
export class BillingInfoService {
	constructor(private readonly prisma: PrismaService) {}


	public async get(userId:string) {
		try {
			const billingInfo = await this.prisma.billingInfo.findUnique({
				where: {
					userId
				}
			})

			if(!billingInfo) {
				throw new NotFoundException('Billing information is not found')
			}

			return billingInfo
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async create(dto: CreateBillingInfoInput, userId:string) {
		try {	
			const billingInfo  = await this.prisma.billingInfo.findUnique({
				where: {
					userId
				}
			})

			if(billingInfo) {
				throw new ConflictException("You already have billing info.")
			}

			return await this.prisma.billingInfo.create({
				data:{
					...dto,
					userId 
				}
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
	
	public async update(id:string, dto: UpdateBillingInfoInput, userId:string) {
		try {
			const billingInfo = await this.prisma.billingInfo.findUnique({where: {id}})

			if(!billingInfo) {
				throw  new NotFoundException("User doesn't have billing info")
			}

			if(billingInfo.userId !== userId) {
				throw new ForbiddenException('You cannot update billing info of other users')
			}

			return await this.prisma.billingInfo.update({
				where: {
					id, userId
				},
				data: dto
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
