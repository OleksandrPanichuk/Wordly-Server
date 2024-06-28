import { STORAGE_FOLDER_NAME } from '@/constants'
import { TypeFile, TypeUploadedFile } from '@/types'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary'

@Injectable()
export class StorageService {
	private readonly cloudinary: typeof cloudinary

	constructor(private readonly config: ConfigService) {
		cloudinary.config({
			api_key: config.get<string>('CLOUDINARY_API_KEY'),
			api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
			cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME')
		})
		this.cloudinary = cloudinary
	}

	public async upload(file: TypeFile): Promise<TypeUploadedFile> {
		try { 
			const uploadedFile: UploadApiResponse = await new Promise(
				(resolve, reject) =>
					this.cloudinary.uploader
						.upload_stream(
							{
								folder: STORAGE_FOLDER_NAME
							},
							(err, res) => {
								if (res) resolve(res)
								if (err) reject(err)
							}
						)
						.end(file.buffer)
			)

			return { key: uploadedFile.public_id, url: uploadedFile.secure_url }
		} catch (err) {
			throw new InternalServerErrorException('Failed to upload file')
		}
	}

	public async delete(key: string) {
		await cloudinary.uploader.destroy(key)
	}
}
