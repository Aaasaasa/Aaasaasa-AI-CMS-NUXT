// =============================================================================
// CORE API RESPONSE FUNCTIONS
// =============================================================================

/**
 * Create a standard API response
 * @param data - The data to return in the response
 * @param statusCode - The HTTP status code (default is 200)
 * @param message - Optional response message
 * @returns An ApiResponse object
 * @template T - The type of the data in the response
 */
export function createApiResponse<T>(
  data?: T | null,
  statusCode: number = HTTP_STATUS.OK,
  message?: string
): ApiResponse<T> {
  return {
    statusCode,
    data,
    message
  }
}

/**
 * Create a typed API error with proper structure
 * @param statusCode - HTTP status code
 * @param code - Error code from ERROR_CODES
 * @param message - Override message (optional, defaults to error code message)
 * @param data - Additional error data
 * @throws {H3Error} Throws a properly structured error
 */
export function createApiError(
  statusCode: number,
  code: ErrorCode,
  message?: string,
  data?: Partial<ApiErrorData>
): never {
  const errorData: ApiErrorData = {
    code,
    message: message || ERROR_MESSAGES[code] || code,
    ...data
  }

  throw createError({
    statusCode,
    statusMessage: errorData.message,
    data: errorData
  })
}

// =============================================================================
// SUCCESS RESPONSE HELPERS
// =============================================================================

/**
 * Create a response for created resources (201)
 * @param data - The data of the created resource
 * @returns An ApiResponse object with status code 201 (Created)
 * @template T - The type of the data in the response
 */
export function createCreatedResponse<T>(data: T): ApiResponse<T> {
  return createApiResponse(data, HTTP_STATUS.CREATED, 'Resource created successfully')
}

/**
 * Create a response for no content operations (204)
 * @returns An ApiResponse object with status code 204 (No Content)
 */
export function createNoContentResponse(): ApiResponse<null> {
  return createApiResponse(null, HTTP_STATUS.NO_CONTENT, 'No Content')
}

/**
 * Create a response for deleted resources (204)
 * @returns An ApiResponse object with status code 204 (No Content)
 */
export function createDeletedResponse(): ApiResponse<null> {
  return createApiResponse(null, HTTP_STATUS.NO_CONTENT, 'Resource deleted successfully')
}

// =============================================================================
// ERROR HELPER FUNCTIONS
// =============================================================================
// Error helpers are defined in ./errors.ts; import directly there to avoid duplicate exports.

// Additional helpers that wrap createApiError and are not provided by errors.ts
export function validationError(
  code: ErrorCode = ERROR_CODES.VALIDATION.ERROR,
  message?: string,
  field?: string,
  details?: Record<string, any>
): never {
  return createApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, code, message, {
    field,
    details
  })
}

export function rateLimitError(
  code: ErrorCode = ERROR_CODES.RATE_LIMIT.EXCEEDED,
  message?: string,
  data?: Partial<ApiErrorData>
): never {
  return createApiError(HTTP_STATUS.TOO_MANY_REQUESTS, code, message, data)
}
