import prisma from '~~/server/utils/prismaCms'
import type { PublicUser, CreateUserData } from '#shared/models/user'
import { toPublicUser } from '#shared/models/user'
import { ERROR_CODES, PRISMA_ERRORS } from '#shared/constants/errors'
import { conflictError, serverError, unauthorizedError } from '~~/server/utils/errors'

/**
 * User Service - Pure business logic without validation
 * Validation is handled in the API endpoints
 */

/**
 * Create a new user with hashed password
 */
export async function createUser(userData: CreateUserData): Promise<PublicUser> {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        { login: userData.email } // Allow email as login too
      ]
    }
  })

  if (existingUser) {
    throw conflictError(ERROR_CODES.USER.EMAIL_ALREADY_EXISTS)
  }

  // Hash password using auto-imported function from nuxt-auth-utils
  const hashedPassword = await hashPassword(userData.password)

  try {
    const user = await prisma.user.create({
      data: {
        login: userData.email.split('@')[0], // Use email prefix as login
        email: userData.email,
        password: hashedPassword,
        displayName: userData.name
      }
    })

    return toPublicUser(user)
  } catch (error: any) {
    if (error.code === PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED) {
      throw conflictError(ERROR_CODES.USER.EMAIL_ALREADY_EXISTS)
    }
    throw serverError(ERROR_CODES.SERVER.DATABASE_ERROR, 'Failed to create user')
  }
}

/**
 * Authenticate user with email/username and password
 */
export async function authenticateUser(
  emailOrLogin: string,
  password: string
): Promise<PublicUser> {
  // Try to find user by email or login
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrLogin }, { login: emailOrLogin }]
    }
  })

  if (!user) {
    throw unauthorizedError(ERROR_CODES.AUTH.INVALID_CREDENTIALS)
  }

  // Verify password using auto-imported function from nuxt-auth-utils
  const isPasswordValid = await verifyPassword(user.password, password)
  if (!isPasswordValid) {
    throw unauthorizedError(ERROR_CODES.AUTH.INVALID_CREDENTIALS)
  }

  return toPublicUser(user)
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id }
  })

  return user ? toPublicUser(user) : null
}

/**
 * Check if user owns a specific post
 */
export async function userOwnsPost(userId: number, postId: number): Promise<boolean> {
  const post = await prisma.article.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  return post?.authorId === userId || false
}
