import { Module } from '@nestjs/common';
import { MeaningsService } from './meanings.service';
import { MeaningsController } from './meanings.controller';

@Module({
  controllers: [MeaningsController],
  providers: [MeaningsService],
})
export class MeaningsModule {}
