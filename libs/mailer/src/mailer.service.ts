import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'fs'
import * as handlebars from 'handlebars'
import * as path from 'node:path'
import { SendMailOptions, Transporter, createTransport } from 'nodemailer'

const TEMPLATE_BASE_DIR = 'static'

@Injectable()
export class MailerService {
	private readonly logger = new Logger(MailerService.name)
	private transporter: Transporter

	constructor(private config: ConfigService) {
		this.transporter = createTransport({
			// @ts-expect-error sth with transporter
			host: config.get('MAIL_HOST'),
			secure: true,
			port: config.get<string>('MAIL_PORT'),
			auth: {
				user: config.get<string>('MAIL_USER'),
				pass: config.get<string>('MAIL_PASSWORD')
			},
			from: config.get<string>('MAIL_FROM')
		})

		this.verifyTransporter()
	}

	private verifyTransporter() {
		if (!this.transporter.verify) return
		Promise.resolve(this.transporter.verify())
			.then(() => this.logger.debug(`Transporter is ready`))
			.catch((error) =>
				this.logger.error(
					`Error occurred while verifying the transporter: ${error.message}`
				)
			)
	}

	public async getHTML(fileUrl: string, data: any) {
		const templateBaseDir = TEMPLATE_BASE_DIR
		const templateExt = path.extname(fileUrl) || '.hbs'
		let templateName = path.basename(fileUrl, path.extname(fileUrl))

		const templateDir = path.isAbsolute(fileUrl)
			? path.dirname(fileUrl)
			: path.join(templateBaseDir, path.dirname(fileUrl))
		const templatePath = path.join(templateDir, templateName + templateExt)

		templateName = path
			.relative(templateBaseDir, templatePath)
			.replace(templateExt, '')

		const file = readFileSync(templatePath, 'utf-8')

		const template = handlebars.compile(file)
		return template(data)
	}

	public sendMail(mailOptions: SendMailOptions) {
		return this.transporter.sendMail(mailOptions, (err) => {
			if (err) {
				this.logger.error(err.message)
			}
		})
	}
}
