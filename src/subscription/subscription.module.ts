import { Module } from '@nestjs/common'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { PaymentsModule } from './payments/payments.module';

@Module({
	controllers: [SubscriptionController],
	providers: [SubscriptionService],
	exports: [SubscriptionService],
	imports: [PaymentsModule]
})
export class SubscriptionModule {}
