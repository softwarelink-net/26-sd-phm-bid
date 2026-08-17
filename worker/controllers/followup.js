import { json, error, parseBody, requireAuth, queryAll, runSql, writeAudit, clientIp, newId } from './_shared.js'

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'FOLLOWUP_NURSE', 'AUDITOR'])
  if (auth.error) return auth.error
  const rows = await queryAll(
    context.env,
    `SELECT t.*, c.patient_name_mask, c.disease_type
     FROM sdphm_followup_tasks t
     LEFT JOIN sdphm_chronic_records c ON c.id = t.chronic_record_id
     ORDER BY t.plan_followup_date ASC`,
  )
  return json({ success: true, data: rows || [] })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.chronic_record_id || !body?.plan_followup_date) return error('缺少随访计划字段')
  const id = newId('fu')
  const ok = await runSql(
    context.env,
    `INSERT INTO sdphm_followup_tasks
      (id, chronic_record_id, plan_followup_date, followup_method, followup_status, executor_id, next_followup_date)
     VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
    [id, body.chronic_record_id, body.plan_followup_date, body.followup_method || 'PHONE', body.executor_id || 'u_nurse', body.next_followup_date || null],
  )
  if (!ok) return error('派发失败', 500)
  await writeAudit(context.env, auth.user.id, 'REPORT_SUBMIT', id, '派发随访任务', clientIp(context.request))
  return json({ success: true, data: { id } })
}

export async function onRequestPatch(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'FOLLOWUP_NURSE'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.id) return error('缺少任务编号')
  const ok = await runSql(
    context.env,
    `UPDATE sdphm_followup_tasks
     SET followup_status = ?, actual_followup_date = ?, clinical_feedback = ?, next_followup_date = ?, executor_id = ?
     WHERE id = ?`,
    [
      body.followup_status || 'COMPLETED',
      body.actual_followup_date || new Date().toISOString().slice(0, 10),
      body.clinical_feedback || '',
      body.next_followup_date || null,
      auth.user.id,
      body.id,
    ],
  )
  if (!ok) return error('回填失败', 500)
  await writeAudit(context.env, auth.user.id, 'REPORT_SUBMIT', body.id, '随访执行回填', clientIp(context.request))
  return json({ success: true, data: { id: body.id } })
}
