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
import { GetWordByNameInput, SearchInput } from './dictionary.dto'
import { DictionaryService } from './dictionary.service'

@UseInterceptors(CacheInterceptor)
@Controller('dictionary')
export class DictionaryController {
	constructor(private readonly dictionaryService: DictionaryService) {}


	@Get('')
	@HttpCode(HttpStatus.OK)
	search(@Query() query: SearchInput) {
		return this.dictionaryService.search(query)
	}

	@Get('/:word')
	@HttpCode(HttpStatus.OK)
	getWordByName(
		@Param('') dto: GetWordByNameInput,
		
	) {
		return this.dictionaryService.getWordByName(dto)
	}
}
