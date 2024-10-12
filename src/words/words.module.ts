import { MeaningsModule } from '@/meanings/meanings.module'
import { WordsDictionaryModule } from '@app/words-dictionary'
import { Module } from '@nestjs/common'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

@Module({
	imports: [MeaningsModule, WordsDictionaryModule],
	controllers: [WordsController],
	providers: [WordsService]
})
export class WordsModule {}
