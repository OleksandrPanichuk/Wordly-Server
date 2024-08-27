import { SubscriptionModule } from '@/subscription/subscription.module'
import { Module } from '@nestjs/common'
import { MeaningsController } from './meanings.controller'
import { MeaningsService } from './meanings.service'
import { CloudinaryModule } from '@app/cloudinary'


@Module({
	imports: [CloudinaryModule, SubscriptionModule],
	controllers: [MeaningsController],
	providers: [MeaningsService],
	exports: [MeaningsService]
})
export class MeaningsModule {}
