import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { DictionaryController } from './dictionary.controller'
import { DictionaryService } from './dictionary.service'

@Module({
	imports: [HttpModule],
	controllers: [DictionaryController],
	providers: [DictionaryService]
})
export class DictionaryModule {}
