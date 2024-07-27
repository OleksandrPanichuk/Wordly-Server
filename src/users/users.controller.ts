import { AuthenticatedGuard, CurrentUser } from '@/common'
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { User } from '@prisma/client'
import { UsersService } from './users.service'
import { UpdateUserInput } from './dto'

@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('current')
	currentUser(@CurrentUser() user: User) {
		return user
	}


	@Patch('current')
	updateUser(@CurrentUser('id') userId: string, @Body() dto: UpdateUserInput) {
		return this.usersService.update(dto, userId)
	}
}
