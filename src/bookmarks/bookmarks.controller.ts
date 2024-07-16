import { AuthenticatedGuard, CurrentUser } from '@/common'
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
import { CreateBookmarkInput, GetAllBookmarksInput } from './dto'

@UseGuards(AuthenticatedGuard)
@Controller('bookmarks')
export class BookmarksController {
	constructor(private readonly bookmarksService: BookmarksService) {}

	@Get()
	getAllBookmarks(
		@Query() dto: GetAllBookmarksInput,
		@CurrentUser('id') userId: string
	) {
		return this.bookmarksService.getAll(dto, userId)
	}

	@Post()
	createBookmark(
		@Body() dto: CreateBookmarkInput,
		@CurrentUser('id') userId: string
	) {
		return this.bookmarksService.create(dto, userId)
	}

	@Delete('/:bookmarkId')
	deleteBookmark(
		@Param('bookmarkId') id: string,
		@CurrentUser('id') userId: string
	) {
		return this.bookmarksService.delete(id, userId)
	}
}
