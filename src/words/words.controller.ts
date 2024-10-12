import { AdminGuard, CurrentUser, SubscribedGuard } from '@/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
	ValidationPipe
} from '@nestjs/common'
import { User } from '@prisma/client'
import {
	CreateWordInput,
	FindManyWordsInput,
	FindWordByIdInput,
	FindWordByNameInput,
	UpdateWordInput
} from './dto'
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

	@Get(':id')
	findById(@Param() dto: FindWordByIdInput) {
		return this.wordsService.findById(dto)
	}

	@Get('/name/:name')
	findByName(@Param() dto: FindWordByNameInput) {
		return this.wordsService.findByName(dto)
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

	@UseGuards(SubscribedGuard)
	@Patch('/:wordId')
	updateWord(
		@Param('wordId') wordId: string,
		@Body() dto: UpdateWordInput,
	) {
		return this.wordsService.update(wordId, dto)
	}

	@UseGuards(AdminGuard)
	@Patch('/admin/:wordId')
	updateWordAdmin(
		@Param('wordId') wordId: string,
		@Body() dto: UpdateWordInput,
	) {
		return this.wordsService.update(wordId, dto)
	}

	@UseGuards(SubscribedGuard)
	@Delete('/:wordId')
	deleteWord(@Param('wordId') wordId: string, @CurrentUser() user: User) {
		return this.wordsService.delete(wordId, user)
	}

	@UseGuards(AdminGuard)
	@Delete('/admin/:wordId')
	deleteWordAdmin(@Param('wordId') wordId: string, @CurrentUser() user: User) {
		return this.wordsService.delete(wordId, user)
	}
}
