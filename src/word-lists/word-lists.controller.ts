import { Controller } from '@nestjs/common';
import { WordListsService } from './word-lists.service';

@Controller('word-lists')
export class WordListsController {
  constructor(private readonly wordListsService: WordListsService) {}
}
