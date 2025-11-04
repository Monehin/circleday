import { auth } from '@/lib/auth/config'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest } from 'next/server'

const handler = toNextJsHandler(auth)

export async function GET(req: NextRequest) {
  console.log('[Auth API] GET', {
    url: req.url,
    pathname: new URL(req.url).pathname,
    cookies: req.cookies.getAll().map(c => c.name),
  })
  const response = await handler.GET(req)
  console.log('[Auth API] GET Response', {
    status: response.status,
    setCookies: response.headers.getSetCookie?.() || [],
  })
  return response
}

export async function POST(req: NextRequest) {
  console.log('[Auth API] POST', {
    url: req.url,
    pathname: new URL(req.url).pathname,
    cookies: req.cookies.getAll().map(c => c.name),
  })
  const response = await handler.POST(req)
  console.log('[Auth API] POST Response', {
    status: response.status,
    setCookies: response.headers.getSetCookie?.() || [],
  })
  return response
}

