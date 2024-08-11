import { AuthenticatedGuard } from "@/common"
import { CloudinaryService } from '@app/cloudinary'
import { Controller, Delete, HttpStatus, Param, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"


@UseGuards(AuthenticatedGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly cloudinary: CloudinaryService) {}

	@UseInterceptors(FileInterceptor('file'))
	@Post('upload')
	upload(@UploadedFile(
		new ParseFilePipeBuilder()
			.addFileTypeValidator({
				fileType: /\/(jpg|jpeg|png|gif|webp|jfif)$/
			})
			.build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
	) file: Express.Multer.File) {
		return this.cloudinary.upload(file)
	}

	// TODO: additionally check whether this file is used somewhere in the app, if yes - throw error, if no - delete file
	@Delete("delete/:key") 
	delete(@Param('key') key:string) {
		return this.cloudinary.delete(key)
	}
}