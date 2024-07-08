import { CacheInterceptor } from '@nestjs/cache-manager'
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
	UseInterceptors
} from '@nestjs/common'
import { GetWordByNameInput } from './dictionary.dto'
import { DictionaryService } from './dictionary.service'

@UseInterceptors(CacheInterceptor)
@Controller('dictionary')
export class DictionaryController {
	constructor(private readonly dictionaryService: DictionaryService) {}


	@Get('')
	@HttpCode(HttpStatus.OK)
	searchWords(@Query('q') searchQuery: string) {
		return this.dictionaryService.searchWords(searchQuery)
	}

	@Get('/:word')
	@HttpCode(HttpStatus.OK)
	getWordByName(
		@Param('word') word: string,
		@Query('mode') mode: GetWordByNameInput['mode'] = 'DICTIONARY'
	) {
		return this.dictionaryService.getWordByName({ mode, word })
	}
}
