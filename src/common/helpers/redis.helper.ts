import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import RedisPrimary from 'ioredis'

@Injectable()
export class Redis {
	private static instance: RedisPrimary

	public static getInstance(config:ConfigService): RedisPrimary {
		if (this.instance) {
      return this.instance
    }
    this.instance = new RedisPrimary(config.get("REDIS_URL"))

    this.instance.on('error', (err) => console.log(err))

    return this.instance

	}
}


export type RedisType = RedisPrimary