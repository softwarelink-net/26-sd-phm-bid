import { CORS_HEADERS, json, error, parseBody, signJwt, requireAuth, DEMO_PASSWORDS, MOCK_USERS, queryFirst, writeAudit, clientIp } from './_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await parseBody(request)
  const username = body?.username || body?.email
  if (!username || !body?.password) {
    return error('请提供账号与密码')
  }

  let user = await queryFirst(
    env,
    'SELECT id, username, real_name, role, department FROM sdphm_users WHERE username = ? AND is_active = 1',
    [username],
  )

  if (!user) {
    user = MOCK_USERS.find((u) => u.username === username)
  }

  const expected = DEMO_PASSWORDS[username]
  if (!user || expected !== body.password) {
    return error('账号或密码错误', 401)
  }

  const secret = env.JWT_SECRET || 'sd-phm-bid-demo-jwt-secret-2026'
  const token = await signJwt(
    {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
      department: user.department,
    },
    secret,
  )

  await writeAudit(env, user.id, 'LOGIN', 'auth', `${user.real_name} 登录控制台`, clientIp(request))

  return json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
      department: user.department,
    },
  })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env)
  if (auth.error) return auth.error
  return json({ success: true, user: auth.user })
}
