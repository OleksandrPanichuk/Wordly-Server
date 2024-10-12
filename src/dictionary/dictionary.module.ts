import { WordsDictionaryModule } from '@app/words-dictionary'
import { Module } from '@nestjs/common'
import { DictionaryController } from './dictionary.controller'
import { DictionaryService } from './dictionary.service'

@Module({
	imports: [WordsDictionaryModule],
	controllers: [DictionaryController],
	providers: [DictionaryService]
})
export class DictionaryModule {}
