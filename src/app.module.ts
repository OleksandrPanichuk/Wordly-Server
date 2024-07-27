import { Module } from '@nestjs/common'

import { PrismaModule } from '@app/prisma'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'
import { AuthModule } from './auth/auth.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { UsersModule } from './users/users.module'
import { WordsModule } from './words/words.module'
import { MeaningsModule } from './meanings/meanings.module'
import { BookmarksModule } from './bookmarks/bookmarks.module'
import { SetsModule } from './sets/sets.module'
import { PacksModule } from './packs/packs.module'
import { ListsModule } from './lists/lists.module'
import { MulterModule } from '@nestjs/platform-express'
import { StorageModule } from './storage/storage.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MulterModule.register({
			limits: {
				fileSize: 10 * 1024 * 1024
			}
		}),
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			ttl: 3600,
			url: process.env.REDIS_URL,
		}),
		UsersModule,
		PrismaModule,
		DictionaryModule,
		SubscriptionModule,
		WordsModule,
		MeaningsModule,
		BookmarksModule,
		SetsModule,
		PacksModule,
		ListsModule,
		StorageModule
	]
})
export class AppModule {}
