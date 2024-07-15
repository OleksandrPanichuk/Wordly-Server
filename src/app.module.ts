import { Module } from '@nestjs/common'

import { PrismaModule } from '@app/prisma'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'
import { AuthModule } from './auth/auth.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { UsersModule } from './users/users.module'
import { WordsModule } from './words/words.module';
import { MeaningsModule } from './meanings/meanings.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { SetsModule } from './sets/sets.module';
import { PacksModule } from './packs/packs.module';
import { WordListsModule } from './word-lists/word-lists.module';

@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		CacheModule.register({
			isGlobal: true,
			store: redisStore,
			ttl: 7200,
			url: process.env.REDIS_URL
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
		WordListsModule
	]
})
export class AppModule {}
