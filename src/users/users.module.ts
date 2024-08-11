import { CloudinaryModule } from '@app/cloudinary'
import { Module } from '@nestjs/common'
import { BillingInfoModule } from './billing-info/billing-info.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [BillingInfoModule, CloudinaryModule]
})
export class UsersModule {}
