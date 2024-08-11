import { CloudinaryModule } from '@app/cloudinary'
import { Module } from '@nestjs/common'
import { StorageController } from './storage.controller'

@Module({
	imports: [CloudinaryModule],
	controllers: [StorageController]
})
export class StorageModule {}
