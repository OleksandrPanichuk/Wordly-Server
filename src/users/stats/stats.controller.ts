import { Controller, Get, UseGuards } from '@nestjs/common'
import { StatsService } from './stats.service'
import { AuthenticatedGuard, CurrentUser, SubscribedGuard } from '@/common'

@UseGuards(AuthenticatedGuard)
@Controller('statistic')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}



  @UseGuards(SubscribedGuard)
  @Get('editing')
  getEditingStats(@CurrentUser('id') userId: string) {
    return this.statsService.getEditingStats(userId)
  }
  
}
