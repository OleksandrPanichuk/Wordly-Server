import { AuthenticatedGuard, UserGuard } from '@/common'
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards
} from '@nestjs/common'
import { BillingInfoService } from './billing-info.service'
import { CreateBillingInfoInput, UpdateBillingInfoInput } from './dto'

@UseGuards(UserGuard())
@UseGuards(AuthenticatedGuard)
@Controller('/users/:userId/billing-info')
export class BillingInfoController {
	constructor(private readonly billingInfoService: BillingInfoService) {}

	@Get('')
	getBillingInfo(@Param('userId') userId: string) {
		return this.billingInfoService.findByUserId(userId)
	}

	@Post()
	createBillingInfo(
		@Body() dto: CreateBillingInfoInput,
		@Param('userId') userId: string
	) {
		return this.billingInfoService.create(dto, userId)
	}

	@Patch(':billingInfoId')
	updateBillingInfo(
		@Param('billingInfoId') id: string,
		@Param('userId') userId: string,
		@Body() dto: UpdateBillingInfoInput
	) {
		return this.billingInfoService.update(id, dto, userId)
	}
}
