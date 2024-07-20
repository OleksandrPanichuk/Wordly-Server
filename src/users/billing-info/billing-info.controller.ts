import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { BillingInfoService } from './billing-info.service'
import { CreateBillingInfoInput, UpdateBillingInfoInput } from './dto'
import { AuthenticatedGuard, CurrentUser } from '@/common'

@UseGuards(AuthenticatedGuard)
@Controller('billing-info')
export class BillingInfoController {
	constructor(private readonly billingInfoService: BillingInfoService) {}

	@Post()
	createBillingInfo(@Body() dto: CreateBillingInfoInput , @CurrentUser('id') userId: string) {
		return this.billingInfoService.create(dto, userId)
	}

	@Patch(':billingInfoId')
	updateBillingInfo(@Param('billingInfoId') id: string, @Body() dto: UpdateBillingInfoInput, @CurrentUser("id") userId:string) {
		return this.billingInfoService.update(id, dto, userId)
	}
}
