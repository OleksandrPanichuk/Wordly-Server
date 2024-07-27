import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class UploadedFile {
	@IsNotEmpty()
	@IsString()
	readonly key: string

	@IsNotEmpty()
	@IsUrl()
	readonly url: string
}
