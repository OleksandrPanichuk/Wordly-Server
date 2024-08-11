import { AuthenticatedGuard, CurrentUser } from '@/common'
import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common'
import { User } from '@prisma/client'
import { UpdateUserInput } from './dto'
import { UsersService } from './users.service'

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

	@Delete('current')
	deleteUser(@CurrentUser() user: User) {
		return this.usersService.delete(user)
	}
}
