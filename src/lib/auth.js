import jwt from 'jsonwebtoken'
import { cookies, headers } from 'next/headers'

export function signToken (payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken (token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export function getUserFromRequest () {
  // Prefer cookie
  const jar = cookies()
  const token = jar.get('token')?.value || headers().get('authorization')?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}
