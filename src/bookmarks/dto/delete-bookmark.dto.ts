import { IsMongoId } from 'class-validator'

export class DeleteBookmarkInput {
	@IsMongoId()
	readonly bookmarkId: string
}
