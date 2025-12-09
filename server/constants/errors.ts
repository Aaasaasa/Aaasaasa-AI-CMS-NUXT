// server/constants/errors.ts - Error Constants für Services

export const ERROR_CODES = {
  VALIDATION: {
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELDS: 'MISSING_FIELDS'
  },
  SERVER: {
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },
  RESOURCE: {
    NOT_FOUND: 'NOT_FOUND',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    ALREADY_EXISTS: 'ALREADY_EXISTS'
  },
  AUTH: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    SESSION_REQUIRED: 'SESSION_REQUIRED'
  }
} as const

// PRISMA_ERRORS are defined in prisma.ts

// Flatten all error codes into a union type
export type ErrorCode =
  | (typeof ERROR_CODES.VALIDATION)[keyof typeof ERROR_CODES.VALIDATION]
  | (typeof ERROR_CODES.SERVER)[keyof typeof ERROR_CODES.SERVER]
  | (typeof ERROR_CODES.RESOURCE)[keyof typeof ERROR_CODES.RESOURCE]
  | (typeof ERROR_CODES.AUTH)[keyof typeof ERROR_CODES.AUTH]

export type PrismaErrorCode = keyof typeof PRISMA_ERRORS
