import { SubscriptionModule } from '@/subscription/subscription.module'
import { StorageModule } from '@app/storage'
import { Module } from '@nestjs/common'
import { MeaningsController } from './meanings.controller'
import { MeaningsService } from './meanings.service'

@Module({
	imports: [StorageModule, SubscriptionModule],
	controllers: [MeaningsController],
	providers: [MeaningsService]
})
export class MeaningsModule {}
