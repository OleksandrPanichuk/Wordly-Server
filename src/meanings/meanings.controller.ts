import { Controller } from '@nestjs/common';
import { MeaningsService } from './meanings.service';

@Controller('meanings')
export class MeaningsController {
  constructor(private readonly meaningsService: MeaningsService) {}
}
