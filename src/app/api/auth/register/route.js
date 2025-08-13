import { NextResponse } from 'next/server'
import { get, run, ensureDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST (req) {
  try {
    await ensureDb()
    const { email, password } = await req.json()
    console.log(email, password)
    console.log("1")
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    console.log("2")
    const existing = await get('SELECT id FROM users WHERE email = ?', [email])
    console.log(existing)
    console.log("3")
    if (existing) return NextResponse.json({ error: 'email already in use' }, { status: 409 })
    console.log("4")
    const hash = await bcrypt.hash(password, 10)
    console.log("5")
    await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash])
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
