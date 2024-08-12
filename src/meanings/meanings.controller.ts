import {
	AdminGuard,
	AuthenticatedGuard,
	CurrentUser,
	SubscribedGuard
} from '@/common'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseFilePipeBuilder,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { CreateMeaningInput, FindAllMeaningsInput, UpdateMeaningInput } from './dto'
import { MeaningsService } from './meanings.service'

import { FileInterceptor } from '@nestjs/platform-express'
import { User } from '@prisma/client'

@Controller('meanings')
export class MeaningsController {
	constructor(private readonly meaningsService: MeaningsService) {}

	@Get()
	getMeanings(@Query() dto: FindAllMeaningsInput) {
		return this.meaningsService.findAll(dto)
	}

	@UseGuards(SubscribedGuard)
	@Post()
	createMeaning(
		@Body() dto: CreateMeaningInput,
		@CurrentUser('id') userId: string
	) {
		return this.meaningsService.create(dto, userId)
	}

	@UseGuards(AdminGuard)
	@Post('/admin')
	createMeaningAdmin(@Body() dto: CreateMeaningInput) {
		return this.meaningsService.create(dto)
	}

	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(FileInterceptor('file'))
	@Patch('/:meaningId/image')
	updateMeaningImage(
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: /\/(jpg|jpeg|png|gif|webp|jfif)$/
				})
				.build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
		)
		file: Express.Multer.File,
		@Param('meaningId') id: string,
		@CurrentUser() user: User
	) {
		return this.meaningsService.updateMeaningImage(id, file, user)
	}

	@UseGuards(SubscribedGuard)
	@Patch('/:meaningId')
	updateMeaning(
		@Param('meaningId') id: string,
		@Body() dto: UpdateMeaningInput,
		@CurrentUser() user: User
	) {
		return this.meaningsService.update(id, dto, user)
	}

	@UseGuards(AdminGuard)
	@Patch('/admin/:meaningId')
	updateMeaningAdmin(
		@Param('meaningId') id: string,
		@Body() dto: UpdateMeaningInput,
		@CurrentUser() user: User
	) {
		return this.meaningsService.update(id, dto, user)
	}

	@UseGuards(SubscribedGuard)
	@Delete('/:meaningId')
	deleteMeaning(
		@Param('meaningId') id: string,
		@CurrentUser('id') userId: string
	) {
		return this.meaningsService.delete(id, userId)
	}

	@UseGuards(AdminGuard)
	@Delete('/admin/:meaningId')
	deleteMeaningAdmin(@Param('meaningId') id: string) {
		return this.meaningsService.delete(id)
	}
}
