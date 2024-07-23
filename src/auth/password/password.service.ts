import { EmailTemplates } from '@/common'
import { MailerService } from '@app/mailer'
import { PrismaService } from '@app/prisma'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { ResetPasswordInput, UpdatePasswordInput } from './dto'

@Injectable()
export class PasswordService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mailer: MailerService,
		private readonly config: ConfigService
	) {}

	public async reset(input: ResetPasswordInput) {
		const user = await this.prisma.user.findUnique({
			where: input
		})

		if (!user) throw new NotFoundException('User not found')

		const code = uuid()

		const link = this.config.get('CLIENT_URL') + `/update-password?code=${code}`
		const html = await this.mailer.getHTML(EmailTemplates.RESET_PASSWORD, { link })

		await this.prisma.passwordResetLink.deleteMany({
			where: {
				userId: user.id
			}
		})

		await this.prisma.passwordResetLink.create({
			data: {
				code,
				userId: user.id
			}
		})

		this.mailer.sendMail({
			html,
			to: user.email,
			subject: 'Reset password'
		})

		return 'Please, check your email address.'
	}

	public async update(input: UpdatePasswordInput) {
		const passwordResetLink = await this.prisma.passwordResetLink.findUnique({
			where: {
				code: input.code
			},
			include: {
				user: true
			}
		})

		if (!passwordResetLink) {
			throw new NotFoundException('Link with such code is not found')
		}

		if (!passwordResetLink.user) {
			throw new NotFoundException('User is not found')
		}

		const salt = await bcrypt.genSalt(10)
		const hash = await bcrypt.hash(input.password, salt)

		await this.prisma.user.update({
			where: {
				id: passwordResetLink.userId
			},
			data: {
				hash
			}
		})

		await this.prisma.passwordResetLink.delete({
			where: {
				id: passwordResetLink.id
			}
		})

		return 'Password successfully updated'
	}
}
