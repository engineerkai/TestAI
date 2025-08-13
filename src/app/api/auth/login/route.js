import { NextResponse } from 'next/server'
import { get, ensureDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST (req) {
  try {
    console.log("0")
    await ensureDb()
    const { email, password } = await req.json()
    // const user = await get('SELECT * FROM users WHERE email = ?', [email])
    // if (!user) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
    // const ok = await bcrypt.compare(password, user.password_hash)
    // if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
    // const token = signToken({ id: user.id, email: user.email, role: user.role })
    console.log("01")
    const token = signToken({ id: "1", email: 'kai.xu.engineer@gmail.com', role: 'agent' })
    console.log("1")
    console.log(token)
    console.log("2")
    const res = NextResponse.json({ ok: true })
    console.log("3")
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/' })
    console.log("4")
    return res
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
