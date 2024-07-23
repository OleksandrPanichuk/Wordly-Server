import { Module } from '@nestjs/common';
import { BillingInfoService } from './billing-info.service';
import { BillingInfoController } from './billing-info.controller';

@Module({
  controllers: [BillingInfoController],
  providers: [BillingInfoService],
})
export class BillingInfoModule {}
