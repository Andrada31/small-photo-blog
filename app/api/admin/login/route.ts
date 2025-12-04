import { NextResponse } from "next/server"

const ADMIN_USER = process.env.ADMIN_USER ?? ""
const ADMIN_PASS = process.env.ADMIN_PASS ?? ""

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const valid =
    ADMIN_USER.length > 0 &&
    ADMIN_PASS.length > 0 &&
    username === ADMIN_USER &&
    password === ADMIN_PASS

  if (!valid) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}