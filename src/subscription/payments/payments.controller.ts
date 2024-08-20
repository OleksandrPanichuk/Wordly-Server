import { AuthenticatedGuard, CurrentUser } from '@/common'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { PaymentsService } from './payments.service'

@UseGuards(AuthenticatedGuard)
@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Get()
	findAll(@CurrentUser('id') userId: string) {
		console.log('REQUEST')
		return this.paymentsService.findAll({ userId })
	}

	@Get(':paymentId')
	findById(
		@CurrentUser('id') userId: string,
		@Param('paymentId') paymentId: string
	) {
		return this.paymentsService.findById({ userId, paymentId })
	}
}
