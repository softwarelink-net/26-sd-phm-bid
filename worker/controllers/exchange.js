import { json, error, parseBody, requireAuth, queryAll, runSql, writeAudit, clientIp } from './_shared.js'

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'AUDITOR'])
  if (auth.error) return auth.error
  const rows = await queryAll(context.env, 'SELECT * FROM sdphm_exchange_jobs ORDER BY id')
  return json({ success: true, data: rows || [] })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.id) return error('缺少任务编号')
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  await runSql(
    context.env,
    `UPDATE sdphm_exchange_jobs SET status = 'SUCCESS', mapped = records, failed = 0, last_sync = ? WHERE id = ?`,
    [now, body.id],
  )
  await writeAudit(context.env, auth.user.id, 'EXPORT', body.id, '公卫数据交换重推', clientIp(context.request))
  return json({ success: true, data: { id: body.id, last_sync: now } })
}
