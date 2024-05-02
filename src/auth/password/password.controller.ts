import { Body, Controller, Patch, Post } from "@nestjs/common"
import { ResetPasswordInput, UpdatePasswordInput } from "./dto"
import { PasswordService } from "./password.service"

@Controller("/auth/password")
export class PasswordController {
	constructor(private readonly passwordService: PasswordService) {}


	@Post('/reset')
	resetPassword(@Body() input: ResetPasswordInput) {
		return this.passwordService.reset(input)
	}

	@Patch('')
	updatePassword(@Body() input: UpdatePasswordInput) {
		return this.passwordService.update(input)
	}

}
