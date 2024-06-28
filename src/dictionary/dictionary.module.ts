import { HttpModule } from '@nestjs/axios'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { DictionaryController } from './dictionary.controller'
import { DictionaryService } from './dictionary.service'

@Module({
	imports: [HttpModule],
	controllers: [DictionaryController],
	providers: [
		DictionaryService,
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor
		}
	]
})
export class DictionaryModule {}
