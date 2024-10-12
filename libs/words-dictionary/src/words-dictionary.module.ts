import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { WordsDictionaryService } from './words-dictionary.service'

@Module({
	imports: [HttpModule],
	providers: [WordsDictionaryService],
	exports: [WordsDictionaryService]
})
export class WordsDictionaryModule {}
