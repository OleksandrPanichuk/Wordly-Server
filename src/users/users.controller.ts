import { AuthenticatedGuard } from '@app/guards'
import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('current')
	@UseGuards(AuthenticatedGuard)
	currentUser(@Req() req: Request) {
		
		return req.user
	}
}
