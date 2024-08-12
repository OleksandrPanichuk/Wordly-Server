import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable } from '@nestjs/common'
import { CreatePaymentInput, FindAllPaymentsInput } from './dto'

@Injectable()
export class PaymentsService {
	constructor(private readonly prisma: PrismaService) {}

	public async findAll(input: FindAllPaymentsInput) {
		return this.prisma.payment.findMany({
			where: input,
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	public async create(input: CreatePaymentInput) {
		try {
			return await this.prisma.payment.create({
				data: input
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
