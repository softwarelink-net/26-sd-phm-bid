import { json, error, parseBody, requireAuth, queryAll, runSql, writeAudit, clientIp, maskName, newId } from './_shared.js'

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'AUDITOR'])
  if (auth.error) return auth.error
  await writeAudit(context.env, auth.user.id, 'QUERY_PHI', 'infectious', '查询传染病网报', clientIp(context.request))
  const rows = await queryAll(context.env, 'SELECT * FROM sdphm_infectious_reports ORDER BY created_at DESC')
  return json({ success: true, data: rows || [] })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.disease_name) return error('缺少病种')
  const id = newId('inf')
  const code = body.report_code || `SD-AUTO-${Date.now()}`
  const ok = await runSql(
    context.env,
    `INSERT INTO sdphm_infectious_reports
      (id, report_code, patient_name_mask, disease_name, disease_category, source_department, lab_indicator, report_status, reporter_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW', ?)`,
    [
      id,
      code,
      maskName(body.patient_name || body.patient_name_mask || ''),
      body.disease_name,
      body.disease_category || '乙类',
      body.source_department || '消化内科门诊',
      body.lab_indicator || '',
      auth.user.id,
    ],
  )
  if (!ok) return error('上报失败', 500)
  await writeAudit(context.env, auth.user.id, 'REPORT_SUBMIT', id, `提交网报卡 ${code}`, clientIp(context.request))
  return json({ success: true, data: { id, report_code: code } })
}

export async function onRequestPatch(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.id || !body?.report_status) return error('缺少审核参数')
  const reportedAt = body.report_status === 'APPROVED_REPORTED' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
  const ok = await runSql(
    context.env,
    'UPDATE sdphm_infectious_reports SET report_status = ?, reviewer_id = ?, reported_at = ? WHERE id = ?',
    [body.report_status, auth.user.id, reportedAt, body.id],
  )
  if (!ok) return error('审核失败', 500)
  await writeAudit(context.env, auth.user.id, 'REPORT_SUBMIT', body.id, `审核结果 ${body.report_status}`, clientIp(context.request))
  return json({ success: true, data: { id: body.id, report_status: body.report_status } })
}
