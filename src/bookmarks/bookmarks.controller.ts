import { CurrentUser } from '@app/decorators'
import { AuthenticatedGuard } from '@app/guards'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UseGuards
} from '@nestjs/common'
import { BookmarksService } from './bookmarks.service'
import { CreateBookmarkInput, DeleteBookmarkInput, GetAllBookmarksInput } from './dto'

@Controller('bookmarks')
export class BookmarksController {
	constructor(private readonly bookmarksService: BookmarksService) {}

	@UseGuards(AuthenticatedGuard)
	@Get()
	getAllBookmarks(
		@Query() dto: GetAllBookmarksInput,
		@CurrentUser('id') userId: string
	) {
		return this.bookmarksService.getAll(dto, userId)
	}

	@UseGuards(AuthenticatedGuard)
	@Post()
	createBookmark(
		@Body() dto: CreateBookmarkInput,
		@CurrentUser('id') userId: string
	) {
		return this.bookmarksService.create(dto, userId)
	}

	@UseGuards(AuthenticatedGuard)
	@Delete('/:bookmarkId')
	deleteBookmark(
		@Param() params: DeleteBookmarkInput,
		@CurrentUser('id') userId: string
	) {
    return this.bookmarksService.delete(params.bookmarkId, userId)
  }
}
