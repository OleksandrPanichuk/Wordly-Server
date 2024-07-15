import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ConfigService } from '@nestjs/config'

export const getCorsConfig = (config: ConfigService): CorsOptions => ({
	credentials: true,
	origin: [config.get<string>('CLIENT_URL')],
	allowedHeaders: ['X-Xsrf-Token']
})
