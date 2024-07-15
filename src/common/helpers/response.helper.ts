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
	{
		cause: pCause,
		description: pDescription,
		message: pMessage
	}: Omit<CustomErrorConfig, 'status'> = {}
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
		const options: HttpExceptionOptions = {
			cause: pCause,
			description: pDescription
		}
		switch (err.code as PrismaClientErrorCodes) {
			case PrismaClientErrorCodes.NOT_FOUND: {
				const message = pMessage ?? 'Not Found'
				throw new HttpException(message, HttpStatus.NOT_FOUND, options)
			}
			case PrismaClientErrorCodes.OUT_OF_RANGE: {
				const message =
					pMessage ?? 'Some of provided input values is out of range'
				throw new HttpException(message, HttpStatus.BAD_REQUEST, options)
			}
			case PrismaClientErrorCodes.TIMED_OUT: {
				const message = pMessage ?? 'Request timed out'
				throw new HttpException(message, HttpStatus.REQUEST_TIMEOUT, options)
			}
			case PrismaClientErrorCodes.VALIDATION_ERROR: {
				const message = pMessage ?? 'Validation error'
				throw new HttpException(message, HttpStatus.BAD_REQUEST, options)
			}
		}
	}

	throw new HttpException(message, status, {
		cause,
		description
	})
}
