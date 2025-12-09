// server/utils/errors.ts - HTTP Error Utilities

export function badRequestError(code: string, message: string) {
  throw createError({
    statusCode: 400,
    statusMessage: message,
    data: { code }
  })
}

export function unauthorizedError(code: string, message: string) {
  throw createError({
    statusCode: 401,
    statusMessage: message,
    data: { code }
  })
}

export function forbiddenError(code: string, message: string) {
  throw createError({
    statusCode: 403,
    statusMessage: message,
    data: { code }
  })
}

export function notFoundError(code: string, message: string) {
  throw createError({
    statusCode: 404,
    statusMessage: message,
    data: { code }
  })
}

export function conflictError(code: string, message: string) {
  throw createError({
    statusCode: 409,
    statusMessage: message,
    data: { code }
  })
}

export function serverError(code: string, message: string) {
  throw createError({
    statusCode: 500,
    statusMessage: message,
    data: { code }
  })
}
