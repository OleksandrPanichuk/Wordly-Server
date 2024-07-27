import { Controller, UseGuards } from "@nestjs/common"
import {CloudinaryService} from '@app/cloudinary'
import { AuthenticatedGuard } from "@/common"


@UseGuards(AuthenticatedGuard)
@Controller('storage')
export class StorageController {
  	constructor(private readonly cloudinary: CloudinaryService) {}


		
}