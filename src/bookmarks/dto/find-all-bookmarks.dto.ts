import { BookmarkType } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator'

export class FindAllBookmarksInput {
	@IsEnum(BookmarkType)
	readonly type: BookmarkType

	@IsOptional()
	@IsNumber()
	@IsPositive()
	readonly take?: number

	@IsOptional()
	@IsNumber()
	@IsPositive()
	readonly skip?: number
}
