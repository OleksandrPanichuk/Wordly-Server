import { AdminGuard, CurrentUser, SubscribedGuard } from '@/common'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { CreateWordInput } from './dto'
import { WordsService } from './words.service'

@Controller('words')
export class WordsController {
	constructor(private readonly wordsService: WordsService) {}

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
