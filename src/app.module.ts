import { Module } from '@nestjs/common'

import { PrismaModule } from '@app/prisma'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'
import { AuthModule } from './auth/auth.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			ttl: 1800,
			url: process.env.REDIS_URL
		}),
		UsersModule,
		PrismaModule,
		DictionaryModule
	]
})
export class AppModule {}
