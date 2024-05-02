import { Module } from '@nestjs/common'

import { PrismaModule } from '@app/prisma'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		UsersModule,
		PrismaModule
	]
})
export class AppModule {}
