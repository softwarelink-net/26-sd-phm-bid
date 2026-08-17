import { json, requireAuth, queryFirst, queryAll } from './_shared.js'

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env)
  if (auth.error) return auth.error

  const chronicTotal = await queryFirst(context.env, 'SELECT COUNT(*) AS n FROM sdphm_chronic_records')
  const pending = await queryFirst(context.env, `SELECT COUNT(*) AS n FROM sdphm_infectious_reports WHERE report_status = 'PENDING_REVIEW'`)
  const followDone = await queryFirst(context.env, `SELECT COUNT(*) AS n FROM sdphm_followup_tasks WHERE followup_status = 'COMPLETED'`)
  const followAll = await queryFirst(context.env, 'SELECT COUNT(*) AS n FROM sdphm_followup_tasks')
  const districts = await queryAll(
    context.env,
    `SELECT COALESCE(district, '未分区') AS name, COUNT(*) AS value FROM sdphm_chronic_records GROUP BY district`,
  )

  const totalFollow = followAll?.n || 5
  const done = followDone?.n || 1

  return json({
    success: true,
    data: {
      screening_coverage: 86.4,
      chronic_total: chronicTotal?.n || 1284,
      infectious_pending: pending?.n ?? 2,
      followup_rate: Math.round((done / totalFollow) * 1000) / 10,
      funnel: [
        { name: '适龄应筛', value: 4200 },
        { name: '完成问卷/便潜血', value: 3180 },
        { name: '高危纳入', value: 860 },
        { name: '完成内镜', value: 512 },
        { name: '病理确诊', value: 47 },
      ],
      districts: districts?.length
        ? districts
        : [
            { name: '历下区', value: 210 },
            { name: '市中区', value: 186 },
            { name: '槐荫区', value: 142 },
            { name: '天桥区', value: 168 },
            { name: '历城区', value: 254 },
            { name: '章丘区', value: 198 },
            { name: '长清区', value: 126 },
          ],
      infectious_trend: {
        months: ['3月', '4月', '5月', '6月', '7月', '8月'],
        hbv: [12, 15, 11, 18, 16, 14],
        tb: [3, 2, 4, 3, 5, 4],
        hev: [1, 0, 2, 1, 3, 2],
        other: [6, 8, 5, 7, 9, 6],
      },
      disease_mix: [
        { name: '萎缩性胃炎', value: 38 },
        { name: '肠息肉术后', value: 24 },
        { name: '脂肪肝/NASH', value: 18 },
        { name: '溃疡性结肠炎', value: 12 },
        { name: '早癌 ESD 术后', value: 8 },
      ],
      tender: {
        tender_no: 'SDGP370000000202602007491',
        budget: '100,000.00',
        deadline: '2026-08-25 09:00:00',
        purchaser: '山东第一医科大学附属消化病医院',
      },
    },
  })
}
