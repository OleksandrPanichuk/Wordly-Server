import { AdminGuard, CurrentUser, SubscribedGuard } from '@/common'
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UseGuards,
	ValidationPipe
} from '@nestjs/common'
import { CreateWordInput, FindManyWordsInput } from './dto'
import { WordsService } from './words.service'

@Controller('words')
export class WordsController {
	constructor(private readonly wordsService: WordsService) {}

	@Get()
	findMany(
		@Query(
			new ValidationPipe({
				transform: true,
				transformOptions: {
					enableImplicitConversion: true
				}
			})
		)
		dto: FindManyWordsInput
	) {
		return this.wordsService.findMany(dto)
	}

	@UseGuards(SubscribedGuard)
	@Post()
	createWord(@Body() dto: CreateWordInput, @CurrentUser('id') userId: string) {
		return this.wordsService.create(dto, userId)
	}

	@UseGuards(AdminGuard)
	@Post('/admin')
	createWordAdmin(@Body() dto: CreateWordInput) {
		return this.wordsService.create(dto)
	}
}
