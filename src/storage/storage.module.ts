import { CloudinaryModule } from '@app/cloudinary'
import { Module } from '@nestjs/common';

@Module({
	imports: [CloudinaryModule]
})
export class StorageModule {}
