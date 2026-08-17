/** Shared helpers for Cloudflare Workers API handlers */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  })
}

export function error(message, status = 400) {
  return json({ success: false, error: message }, status)
}

export async function parseBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function bytesToBase64Url(bytes) {
  let bin = ''
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function utf8ToBase64Url(str) {
  return bytesToBase64Url(new TextEncoder().encode(str))
}

function base64UrlToBytes(s) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64UrlToUtf8(s) {
  return new TextDecoder().decode(base64UrlToBytes(s))
}

export async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = utf8ToBase64Url(JSON.stringify(header))
  const p = utf8ToBase64Url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }))
  const data = `${h}.${p}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${bytesToBase64Url(new Uint8Array(sig))}`
}

export async function verifyJwt(token, secret) {
  if (!token) return null
  const parts = token.replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3) return null
  const data = `${parts[0]}.${parts[1]}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(parts[2]), new TextEncoder().encode(data))
  if (!ok) return null
  try {
    const payload = JSON.parse(base64UrlToUtf8(parts[1]))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(request, env, roles = []) {
  const auth = request.headers.get('Authorization') || ''
  const secret = env.JWT_SECRET || 'sd-phm-bid-demo-jwt-secret-2026'
  const payload = await verifyJwt(auth, secret)
  if (!payload) return { error: error('未授权，请先登录', 401) }
  if (roles.length && !roles.includes(payload.role) && payload.role !== 'SUPER_ADMIN') {
    return { error: error('权限不足', 403) }
  }
  return { user: payload }
}

export const DEMO_PASSWORDS = {
  'admin@sdphm.cn': 'Admin@2026!',
  'director@sdphm.cn': 'Director@2026!',
  'doctor@sdphm.cn': 'Doctor@2026!',
  'nurse@sdphm.cn': 'Nurse@2026!',
  'auditor@sdphm.cn': 'Auditor@2026!',
}

export const MOCK_USERS = [
  { id: 'u_admin', username: 'admin@sdphm.cn', real_name: '系统管理员', role: 'SUPER_ADMIN', department: '信息技术部' },
  { id: 'u_dir', username: 'director@sdphm.cn', real_name: '张立明主任', role: 'PH_DIRECTOR', department: '公共卫生科' },
  { id: 'u_doc', username: 'doctor@sdphm.cn', real_name: '李思思主治', role: 'CLINIC_DOCTOR', department: '消化内科门诊' },
  { id: 'u_nurse', username: 'nurse@sdphm.cn', real_name: '王芳护师', role: 'FOLLOWUP_NURSE', department: '消化内镜中心随访室' },
  { id: 'u_audit', username: 'auditor@sdphm.cn', real_name: '陈质检员', role: 'AUDITOR', department: '医院医务质控科' },
]

export async function queryAll(env, sql, binds = []) {
  if (!env?.DB) return null
  try {
    const stmt = env.DB.prepare(sql)
    const res = binds.length ? await stmt.bind(...binds).all() : await stmt.all()
    return res.results || []
  } catch {
    return null
  }
}

export async function queryFirst(env, sql, binds = []) {
  if (!env?.DB) return null
  try {
    const stmt = env.DB.prepare(sql)
    return binds.length ? await stmt.bind(...binds).first() : await stmt.first()
  } catch {
    return null
  }
}

export async function runSql(env, sql, binds = []) {
  if (!env?.DB) return false
  try {
    const stmt = env.DB.prepare(sql)
    if (binds.length) await stmt.bind(...binds).run()
    else await stmt.run()
    return true
  } catch {
    return false
  }
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1'
}

export async function writeAudit(env, userId, actionType, resource, details, ip) {
  const id = `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await runSql(
    env,
    'INSERT INTO sdphm_audit_logs (id, user_id, action_type, resource_target, ip_address, details) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId || 'anonymous', actionType, resource || '', ip || '', details || ''],
  )
}

export function maskName(name = '') {
  if (!name) return ''
  if (name.includes('*')) return name
  return name.length <= 2 ? `${name[0]}*` : `${name[0]}*${name.slice(-1)}`
}

export function maskId(id = '') {
  if (!id) return ''
  if (id.includes('*')) return id
  return id.replace(/^(.{6}).*(.{4})$/, '$1****$2')
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
