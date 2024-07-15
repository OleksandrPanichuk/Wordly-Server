import { BookmarkType } from "@prisma/client"
import { IsEnum, IsMongoId } from "class-validator"


export class CreateBookmarkInput {
	@IsEnum(BookmarkType)
	readonly type: BookmarkType

	@IsMongoId()
	readonly itemId: string
}