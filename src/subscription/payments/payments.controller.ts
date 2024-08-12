import { AuthenticatedGuard, CurrentUser } from '@/common'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { PaymentsService } from './payments.service'

@UseGuards(AuthenticatedGuard)
@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Get()
	findAll(@CurrentUser('id') userId: string) {
		return this.paymentsService.findAll({ userId })
	}
}
