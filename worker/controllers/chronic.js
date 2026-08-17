import { json, error, parseBody, requireAuth, queryAll, runSql, writeAudit, clientIp, maskName, maskId, newId } from './_shared.js'

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env)
  if (auth.error) return auth.error
  await writeAudit(context.env, auth.user.id, 'QUERY_PHI', 'chronic', '查询慢病档案', clientIp(context.request))
  const rows = await queryAll(context.env, 'SELECT * FROM sdphm_chronic_records ORDER BY first_diagnosis_date DESC')
  return json({ success: true, data: rows || [] })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.disease_type || !body?.first_diagnosis_date) return error('缺少必填字段')

  const id = body.id || newId('chr')
  const ok = await runSql(
    context.env,
    `INSERT INTO sdphm_chronic_records
      (id, patient_id_card_mask, patient_name_mask, gender, age, disease_type, risk_level, diagnosis_doctor_id, hospital_record_no, first_diagnosis_date, current_status, district)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
    [
      id,
      maskId(body.patient_id_card || body.patient_id_card_mask || ''),
      maskName(body.patient_name || body.patient_name_mask || ''),
      body.gender || 'O',
      Number(body.age) || 0,
      body.disease_type,
      body.risk_level || 'MEDIUM',
      auth.user.id,
      body.hospital_record_no || '',
      body.first_diagnosis_date,
      body.district || '',
    ],
  )
  if (!ok) return error('建档失败', 500)
  await writeAudit(context.env, auth.user.id, 'REPORT_SUBMIT', id, '新建专科慢病档案', clientIp(context.request))
  return json({ success: true, data: { id } })
}
