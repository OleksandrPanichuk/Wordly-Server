import { MeaningsModule } from '@/meanings/meanings.module'
import { Module } from '@nestjs/common'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

@Module({
	imports: [MeaningsModule],
	controllers: [WordsController],
	providers: [WordsService]
})
export class WordsModule {}
