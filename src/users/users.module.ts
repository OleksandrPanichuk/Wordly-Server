import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { BillingInfoModule } from './billing-info/billing-info.module';

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [BillingInfoModule]
})
export class UsersModule {}
