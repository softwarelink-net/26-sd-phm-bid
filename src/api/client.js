/** Client API with local mock fallback when Worker / D1 is unavailable */

const TOKEN_KEY = 'sdphm_token'

export const DEMO_USERS = [
  { id: 'u_admin', username: 'admin@sdphm.cn', password: 'Admin@2026!', real_name: '系统管理员', role: 'SUPER_ADMIN', department: '信息技术部' },
  { id: 'u_dir', username: 'director@sdphm.cn', password: 'Director@2026!', real_name: '张立明主任', role: 'PH_DIRECTOR', department: '公共卫生科' },
  { id: 'u_doc', username: 'doctor@sdphm.cn', password: 'Doctor@2026!', real_name: '李思思主治', role: 'CLINIC_DOCTOR', department: '消化内科门诊' },
  { id: 'u_nurse', username: 'nurse@sdphm.cn', password: 'Nurse@2026!', real_name: '王芳护师', role: 'FOLLOWUP_NURSE', department: '消化内镜中心随访室' },
  { id: 'u_audit', username: 'auditor@sdphm.cn', password: 'Auditor@2026!', real_name: '陈质检员', role: 'AUDITOR', department: '医院医务质控科' },
]

export const RISK_LABEL = { LOW: '低危', MEDIUM: '中危', HIGH: '高危', CRITICAL: '极高危' }
export const RISK_CLASS = {
  LOW: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-rose-50 text-rose-700',
}
export const REPORT_STATUS = {
  PENDING_REVIEW: '待审核',
  APPROVED_REPORTED: '已直报',
  REJECTED: '已驳回',
}
export const FOLLOW_STATUS = {
  PENDING: '待执行',
  COMPLETED: '已完成',
  MISSED: '失访',
  CANCELLED: '已取消',
}
export const FOLLOW_METHOD = {
  PHONE: '电话',
  WECHAT: '微信',
  CLINIC_VISIT: '门诊复诊',
  HOME_VISIT: '入户',
}

const mock = {
  chronic: [
    { id: 'chr_001', patient_id_card_mask: '3708021980****1234', patient_name_mask: '赵*强', patient_name: '赵志强', gender: 'M', age: 46, disease_type: '慢性萎缩性胃炎伴中度肠化', risk_level: 'HIGH', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-08819', first_diagnosis_date: '2026-07-10', current_status: 'ACTIVE', district: '历下区' },
    { id: 'chr_002', patient_id_card_mask: '3708021975****5678', patient_name_mask: '孙*华', patient_name: '孙丽华', gender: 'F', age: 51, disease_type: '结肠多发腺瘤切除术后', risk_level: 'MEDIUM', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-09012', first_diagnosis_date: '2026-08-01', current_status: 'ACTIVE', district: '市中区' },
    { id: 'chr_003', patient_id_card_mask: '3708111962****9910', patient_name_mask: '周*安', patient_name: '周德安', gender: 'M', age: 64, disease_type: '早期胃癌 ESD 术后', risk_level: 'CRITICAL', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-09145', first_diagnosis_date: '2026-08-11', current_status: 'ACTIVE', district: '槐荫区' },
    { id: 'chr_004', patient_id_card_mask: '3708121988****3344', patient_name_mask: '吴*敏', patient_name: '吴晓敏', gender: 'F', age: 38, disease_type: '溃疡性结肠炎（缓解期）', risk_level: 'MEDIUM', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-09201', first_diagnosis_date: '2026-06-18', current_status: 'ACTIVE', district: '天桥区' },
    { id: 'chr_005', patient_id_card_mask: '3708131970****7788', patient_name_mask: '郑*平', patient_name: '郑和平', gender: 'M', age: 56, disease_type: '非酒精性脂肪性肝炎', risk_level: 'HIGH', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-09330', first_diagnosis_date: '2026-05-22', current_status: 'ACTIVE', district: '历城区' },
    { id: 'chr_006', patient_id_card_mask: '3701021968****2211', patient_name_mask: '冯*梅', patient_name: '冯春梅', gender: 'F', age: 58, disease_type: '胃溃疡愈合期', risk_level: 'LOW', diagnosis_doctor_id: 'u_doc', hospital_record_no: 'HIS-2026-09412', first_diagnosis_date: '2026-04-09', current_status: 'ACTIVE', district: '章丘区' },
  ],
  infectious: [
    { id: 'inf_001', report_code: 'SD-HB-20260812-001', patient_name_mask: '赵*强', patient_name: '赵志强', disease_name: '乙型病毒性肝炎', disease_category: '乙类', source_department: '检验科', lab_indicator: 'HBsAg 阳性 / HBV-DNA 2.1E4 IU/mL', report_status: 'PENDING_REVIEW', reporter_id: 'u_doc', created_at: '2026-08-12 10:18:00' },
    { id: 'inf_002', report_code: 'SD-TB-20260813-002', patient_name_mask: '周*安', patient_name: '周德安', disease_name: '肺结核（肠结核待排）', disease_category: '乙类', source_department: '消化内科门诊', lab_indicator: 'T-SPOT 阳性', report_status: 'APPROVED_REPORTED', reporter_id: 'u_doc', reviewer_id: 'u_dir', reported_at: '2026-08-13 16:40:00', created_at: '2026-08-13 09:02:00' },
    { id: 'inf_003', report_code: 'SD-AL-20260815-003', patient_name_mask: '孙*华', patient_name: '孙丽华', disease_name: '戊型肝炎', disease_category: '乙类', source_department: '消化内镜中心', lab_indicator: 'HEV-IgM 阳性', report_status: 'PENDING_REVIEW', reporter_id: 'u_doc', created_at: '2026-08-15 14:22:00' },
    { id: 'inf_004', report_code: 'SD-PW-20260816-004', patient_name_mask: '吴*敏', patient_name: '吴晓敏', disease_name: '其他感染性腹泻病', disease_category: '丙类', source_department: '急诊消化', lab_indicator: '粪便培养产毒性大肠杆菌阳性', report_status: 'REJECTED', reporter_id: 'u_doc', reviewer_id: 'u_dir', created_at: '2026-08-16 08:11:00' },
  ],
  followup: [
    { id: 'fu_001', chronic_record_id: 'chr_003', patient_name_mask: '周*安', disease_type: '早期胃癌 ESD 术后', plan_followup_date: '2026-08-18', followup_method: 'CLINIC_VISIT', followup_status: 'PENDING', executor_id: 'u_nurse', clinical_feedback: '', next_followup_date: '2026-11-16' },
    { id: 'fu_002', chronic_record_id: 'chr_001', patient_name_mask: '赵*强', disease_type: '慢性萎缩性胃炎伴中度肠化', plan_followup_date: '2026-08-17', followup_method: 'PHONE', followup_status: 'PENDING', executor_id: 'u_nurse', clinical_feedback: '', next_followup_date: '2026-11-15' },
    { id: 'fu_003', chronic_record_id: 'chr_002', patient_name_mask: '孙*华', disease_type: '结肠多发腺瘤切除术后', plan_followup_date: '2026-08-10', actual_followup_date: '2026-08-10', followup_method: 'WECHAT', followup_status: 'COMPLETED', executor_id: 'u_nurse', clinical_feedback: '无便血，遵嘱低脂饮食，预约 11 月肠镜', next_followup_date: '2026-11-08' },
    { id: 'fu_004', chronic_record_id: 'chr_005', patient_name_mask: '郑*平', disease_type: '非酒精性脂肪性肝炎', plan_followup_date: '2026-08-05', followup_method: 'PHONE', followup_status: 'MISSED', executor_id: 'u_nurse', clinical_feedback: '两次未接通', next_followup_date: '2026-08-20' },
    { id: 'fu_005', chronic_record_id: 'chr_004', patient_name_mask: '吴*敏', disease_type: '溃疡性结肠炎（缓解期）', plan_followup_date: '2026-08-19', followup_method: 'PHONE', followup_status: 'PENDING', executor_id: 'u_nurse', clinical_feedback: '', next_followup_date: '2026-11-17' },
  ],
  exchange: [
    { id: 'ex_001', dataset: '传染病网络直报卡', standard: 'WS 375.12 / 省平台 v3.2', status: 'SUCCESS', records: 128, mapped: 128, failed: 0, last_sync: '2026-08-16 21:00:00' },
    { id: 'ex_002', dataset: '慢病患者档案', standard: 'GB/T 14396 + 省公卫档案', status: 'PARTIAL', records: 86, mapped: 81, failed: 5, last_sync: '2026-08-16 21:04:00' },
    { id: 'ex_003', dataset: '早癌筛查队列', standard: '国家癌症中心筛查规范', status: 'PENDING', records: 42, mapped: 0, failed: 0, last_sync: null },
    { id: 'ex_004', dataset: '随访履约记录', standard: '山东省公卫随访接口', status: 'SUCCESS', records: 210, mapped: 210, failed: 0, last_sync: '2026-08-15 22:10:00' },
  ],
  configs: [
    { config_key: 'ENABLE_AUTO_INFECTIOUS_SYNC', config_value: 'true', description: '是否开启检验科阳性指征自动同步传染病网报', is_feature_flag: 1 },
    { config_key: 'ENABLE_PHI_MASKING_STRICT', config_value: 'true', description: '全局患者隐私信息严格脱敏开关', is_feature_flag: 1 },
    { config_key: 'DEFAULT_FOLLOWUP_CYCLE_DAYS', config_value: '90', description: '消化系统早癌术后随访默认周期(天)', is_feature_flag: 0 },
    { config_key: 'PROJECT_BID_INFO', config_value: '{"tender_no":"SDGP370000000202602007491","budget":"100,000.00 CNY","deadline":"2026-08-25"}', description: '招标公告元数据缓存', is_feature_flag: 0 },
  ],
  audit: [
    { id: 'aud_001', user_id: 'u_doc', actor: '李思思主治', action_type: 'REPORT_SUBMIT', resource_target: 'inf_001', details: '提交乙肝网报卡', ip_address: '10.12.8.21', created_at: '2026-08-12 10:18:22' },
    { id: 'aud_002', user_id: 'u_dir', actor: '张立明主任', action_type: 'REPORT_SUBMIT', resource_target: 'inf_002', details: '审核通过肺结核直报', ip_address: '10.12.8.8', created_at: '2026-08-13 16:40:11' },
    { id: 'aud_003', user_id: 'u_audit', actor: '陈质检员', action_type: 'QUERY_PHI', resource_target: 'chr_003', details: '审计查询 ESD 术后档案（已脱敏）', ip_address: '10.12.8.90', created_at: '2026-08-16 09:12:00' },
    { id: 'aud_004', user_id: 'u_admin', actor: '系统管理员', action_type: 'UPDATE_CONFIG', resource_target: 'ENABLE_AUTO_INFECTIOUS_SYNC', details: '开启阳性指征自动同步', ip_address: '10.12.1.2', created_at: '2026-08-14 08:00:00' },
    { id: 'aud_005', user_id: 'u_nurse', actor: '王芳护师', action_type: 'EXPORT', resource_target: 'followup', details: '导出今日随访任务清单', ip_address: '10.12.8.44', created_at: '2026-08-17 07:55:00' },
  ],
  stats: {
    screening_coverage: 86.4,
    chronic_total: 1284,
    infectious_pending: 2,
    followup_rate: 91.2,
    funnel: [
      { name: '适龄应筛', value: 4200 },
      { name: '完成问卷/便潜血', value: 3180 },
      { name: '高危纳入', value: 860 },
      { name: '完成内镜', value: 512 },
      { name: '病理确诊', value: 47 },
    ],
    districts: [
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
}

function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
      ...options,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw Object.assign(new Error(body.error || res.statusText), { status: res.status, body })
    }
    return await res.json()
  } catch (err) {
    if (err.status) throw err
    return null
  }
}

function ok(data) {
  return { success: true, data }
}

export async function login(username, password) {
  const remote = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (remote?.success) return remote
  const user = DEMO_USERS.find((u) => u.username === username && u.password === password)
  if (!user) return { success: false, error: '账号或密码错误' }
  const { password: _p, ...safe } = user
  return { success: true, token: `demo.${btoa(JSON.stringify(safe))}`, user: safe }
}

export async function fetchStats() {
  const remote = await request('/api/stats')
  if (remote?.success) return remote.data
  return mock.stats
}

export async function fetchChronic(params = {}) {
  const q = new URLSearchParams(params).toString()
  const remote = await request(`/api/chronic${q ? `?${q}` : ''}`)
  if (remote?.success) return remote.data
  return mock.chronic
}

export async function saveChronic(payload) {
  const remote = await request('/api/chronic', { method: 'POST', body: JSON.stringify(payload) })
  if (remote?.success) return remote
  const id = payload.id || `chr_${Date.now()}`
  const row = {
    ...payload,
    id,
    patient_name_mask: maskName(payload.patient_name || payload.patient_name_mask),
    patient_id_card_mask: maskId(payload.patient_id_card || payload.patient_id_card_mask),
    current_status: 'ACTIVE',
  }
  mock.chronic.unshift(row)
  return ok(row)
}

export async function fetchInfectious() {
  const remote = await request('/api/infectious')
  if (remote?.success) return remote.data
  return mock.infectious
}

export async function submitInfectious(payload) {
  const remote = await request('/api/infectious', { method: 'POST', body: JSON.stringify(payload) })
  if (remote?.success) return remote
  const row = {
    id: `inf_${Date.now()}`,
    report_code: `SD-AUTO-${Date.now()}`,
    report_status: 'PENDING_REVIEW',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    ...payload,
    patient_name_mask: maskName(payload.patient_name || payload.patient_name_mask),
  }
  mock.infectious.unshift(row)
  return ok(row)
}

export async function reviewInfectious(id, report_status) {
  const remote = await request('/api/infectious', { method: 'PATCH', body: JSON.stringify({ id, report_status }) })
  if (remote?.success) return remote
  const row = mock.infectious.find((r) => r.id === id)
  if (row) {
    row.report_status = report_status
    if (report_status === 'APPROVED_REPORTED') row.reported_at = new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  return ok(row)
}

export async function fetchFollowup() {
  const remote = await request('/api/followup')
  if (remote?.success) return remote.data
  return mock.followup
}

export async function assignFollowup(payload) {
  const remote = await request('/api/followup', { method: 'POST', body: JSON.stringify(payload) })
  if (remote?.success) return remote
  const row = { id: `fu_${Date.now()}`, followup_status: 'PENDING', ...payload }
  mock.followup.unshift(row)
  return ok(row)
}

export async function completeFollowup(id, patch) {
  const remote = await request('/api/followup', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) })
  if (remote?.success) return remote
  const row = mock.followup.find((r) => r.id === id)
  if (row) Object.assign(row, patch)
  return ok(row)
}

export async function fetchExchange() {
  const remote = await request('/api/exchange')
  if (remote?.success) return remote.data
  return mock.exchange
}

export async function syncExchange(id) {
  const remote = await request('/api/exchange', { method: 'POST', body: JSON.stringify({ id }) })
  if (remote?.success) return remote
  const row = mock.exchange.find((r) => r.id === id)
  if (row) {
    row.status = 'SUCCESS'
    row.mapped = row.records
    row.failed = 0
    row.last_sync = new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  return ok(row)
}

export async function fetchSystem() {
  const remote = await request('/api/system')
  if (remote?.success) return remote.data
  return { users: DEMO_USERS.map(({ password: _p, ...u }) => u), configs: mock.configs, audit: mock.audit }
}

export async function updateConfig(config_key, config_value) {
  const remote = await request('/api/system', { method: 'PATCH', body: JSON.stringify({ config_key, config_value }) })
  if (remote?.success) return remote
  const row = mock.configs.find((c) => c.config_key === config_key)
  if (row) row.config_value = config_value
  return ok(row)
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

export function displayName(row, masked) {
  if (!row) return ''
  if (masked) return row.patient_name_mask || maskName(row.patient_name)
  return row.patient_name || row.patient_name_mask
}
