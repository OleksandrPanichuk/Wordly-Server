import { generateErrorResponse } from '@/common'
import { PrismaService } from '@app/prisma'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreatePaymentInput, FindAllPaymentsInput, FindByIdInput } from './dto'

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
	public async findById({paymentId, ...input}: FindByIdInput) {
		const payment = await this.prisma.payment.findUnique({
			where: {
				...input,
				id: paymentId
			},
		})

		

		if (!payment) {
			throw new NotFoundException('Payment not found')
		}

		return payment
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
