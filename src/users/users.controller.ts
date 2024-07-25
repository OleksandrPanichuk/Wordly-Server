import { AuthenticatedGuard, CurrentUser } from '@/common'
import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { User } from '@prisma/client'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(AuthenticatedGuard)
	@Get('current')
	currentUser(@CurrentUser() user: User) {
		console.log(user)
		return user
	}
}
