import { type H3Event, getCookie, deleteCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

/**
 * Zapisuje korisničku sesiju u cookie kao JWT token.
 */
export async function setUserSession(event: H3Event, payload: any) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  setCookie(event, 'session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 dana
  })
  return token
}

/**
 * Čita i verifikuje korisničku sesiju iz JWT cookie-ja.
 */
export function getUserSession(event: H3Event): any | null {
  const token = getCookie(event, 'session_token')
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

/**
 * Briše korisničku sesiju (logout).
 */
export function clearUserSession(event: H3Event) {
  deleteCookie(event, 'session_token', { path: '/' })
}
