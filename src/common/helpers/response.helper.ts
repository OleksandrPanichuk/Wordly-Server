import { PrismaClientErrorCodes } from '@/common'
import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

type CustomErrorConfig = {
	message?: string
	description?: string
	cause?: string
	status?: HttpStatus
}

export function generateErrorResponse(
	err: any,
	{
		message = 'Internal Error',
		description = 'server/internal-error',
		cause = 'Internal Error',
		status = 500
	}: CustomErrorConfig = {},
	prismaErrorConfig: Omit<CustomErrorConfig, 'status'> = {}
) {
	if (err instanceof HttpException) {
		let description

		if (typeof err.getResponse() === 'string') {
			description = err.getResponse()
		} else {
			const response = err.getResponse() as { error?: string }
			description = response?.error
		}
		throw new HttpException(err.message, err.getStatus(), {
			description,
			cause: err.cause
		})
	}

	if (err instanceof PrismaClientKnownRequestError) {
		const { cause, description, message } = prismaErrorConfig
		const options: HttpExceptionOptions = {
			cause,
			description
		}
		switch (err.code as PrismaClientErrorCodes) {
			case PrismaClientErrorCodes.NOT_FOUND: {
				const msg = message ?? 'Not Found'
				throw new HttpException(msg, HttpStatus.NOT_FOUND, options)
			}
			case PrismaClientErrorCodes.OUT_OF_RANGE: {
				const msg = message ?? 'Some of provided input values is out of range'
				throw new HttpException(msg, HttpStatus.BAD_REQUEST, options)
			}
			case PrismaClientErrorCodes.TIMED_OUT: {
				const msg = message ?? 'Request timed out'
				throw new HttpException(msg, HttpStatus.REQUEST_TIMEOUT, options)
			}
			case PrismaClientErrorCodes.VALIDATION_ERROR: {
				const msg = message ?? 'Validation error'
				throw new HttpException(msg, HttpStatus.BAD_REQUEST, options)
			}
		}
	}

	throw new HttpException(message, status, {
		cause,
		description
	})
}
