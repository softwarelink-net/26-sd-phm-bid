-- ============================================================
-- 山东第一医科大学附属消化病医院公共卫生管理信息平台
-- Cloudflare D1 / Allworld · 表前缀 sdphm_
-- ============================================================

-- 1. 用户与认证表
CREATE TABLE IF NOT EXISTS sdphm_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    real_name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'FOLLOWUP_NURSE', 'AUDITOR')),
    phone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 系统全局配置与 Feature Flags
CREATE TABLE IF NOT EXISTS sdphm_system_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    is_feature_flag INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 消化系统专科慢病档案表
CREATE TABLE IF NOT EXISTS sdphm_chronic_records (
    id TEXT PRIMARY KEY,
    patient_id_card_mask TEXT NOT NULL,
    patient_name_mask TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('M', 'F', 'O')),
    age INTEGER NOT NULL,
    disease_type TEXT NOT NULL,
    risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    diagnosis_doctor_id TEXT,
    hospital_record_no TEXT,
    first_diagnosis_date DATE NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'ACTIVE',
    district TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(diagnosis_doctor_id) REFERENCES sdphm_users(id)
);

-- 4. 传染病及阳性指征网报表
CREATE TABLE IF NOT EXISTS sdphm_infectious_reports (
    id TEXT PRIMARY KEY,
    report_code TEXT NOT NULL UNIQUE,
    patient_name_mask TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    disease_category TEXT NOT NULL,
    source_department TEXT NOT NULL,
    lab_indicator TEXT,
    report_status TEXT CHECK(report_status IN ('PENDING_REVIEW', 'APPROVED_REPORTED', 'REJECTED')),
    reporter_id TEXT NOT NULL,
    reviewer_id TEXT,
    reported_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reporter_id) REFERENCES sdphm_users(id),
    FOREIGN KEY(reviewer_id) REFERENCES sdphm_users(id)
);

-- 5. 消化道早癌筛查与随访任务表
CREATE TABLE IF NOT EXISTS sdphm_followup_tasks (
    id TEXT PRIMARY KEY,
    chronic_record_id TEXT NOT NULL,
    plan_followup_date DATE NOT NULL,
    actual_followup_date DATE,
    followup_method TEXT CHECK(followup_method IN ('PHONE', 'WECHAT', 'CLINIC_VISIT', 'HOME_VISIT')),
    followup_status TEXT CHECK(followup_status IN ('PENDING', 'COMPLETED', 'MISSED', 'CANCELLED')),
    executor_id TEXT,
    clinical_feedback TEXT,
    next_followup_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chronic_record_id) REFERENCES sdphm_chronic_records(id),
    FOREIGN KEY(executor_id) REFERENCES sdphm_users(id)
);

-- 6. 数据审计与安全日志表
CREATE TABLE IF NOT EXISTS sdphm_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    resource_target TEXT,
    ip_address TEXT,
    details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. 公卫数据交换任务
CREATE TABLE IF NOT EXISTS sdphm_exchange_jobs (
    id TEXT PRIMARY KEY,
    dataset TEXT NOT NULL,
    standard TEXT NOT NULL,
    status TEXT NOT NULL,
    records INTEGER NOT NULL DEFAULT 0,
    mapped INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    last_sync DATETIME
);

-- ============================================================
-- 初始种子数据
-- ============================================================
INSERT OR REPLACE INTO sdphm_system_configs (config_key, config_value, description, is_feature_flag) VALUES
('ENABLE_AUTO_INFECTIOUS_SYNC', 'true', '是否开启检验科阳性指征自动同步传染病网报', 1),
('ENABLE_PHI_MASKING_STRICT', 'true', '全局患者隐私信息严格脱敏开关', 1),
('DEFAULT_FOLLOWUP_CYCLE_DAYS', '90', '消化系统早癌术后随访默认周期(天)', 0),
('PROJECT_BID_INFO', '{"tender_no":"SDGP370000000202602007491","budget":"100,000.00 CNY","deadline":"2026-08-25"}', '招标公告元数据缓存', 0);

-- 演示密码见 README（Worker 侧 DEMO_PASSWORDS 校验，hash 仅为占位）
INSERT OR REPLACE INTO sdphm_users (id, username, password_hash, real_name, department, role) VALUES
('u_admin', 'admin@sdphm.cn', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '信息技术部', 'SUPER_ADMIN'),
('u_dir', 'director@sdphm.cn', 'e10adc3949ba59abbe56e057f20f883e', '张立明主任', '公共卫生科', 'PH_DIRECTOR'),
('u_doc', 'doctor@sdphm.cn', 'e10adc3949ba59abbe56e057f20f883e', '李思思主治', '消化内科门诊', 'CLINIC_DOCTOR'),
('u_nurse', 'nurse@sdphm.cn', 'e10adc3949ba59abbe56e057f20f883e', '王芳护师', '消化内镜中心随访室', 'FOLLOWUP_NURSE'),
('u_audit', 'auditor@sdphm.cn', 'e10adc3949ba59abbe56e057f20f883e', '陈质检员', '医院医务质控科', 'AUDITOR');

INSERT OR REPLACE INTO sdphm_chronic_records (id, patient_id_card_mask, patient_name_mask, gender, age, disease_type, risk_level, diagnosis_doctor_id, hospital_record_no, first_diagnosis_date, district) VALUES
('chr_001', '3708021980****1234', '赵*强', 'M', 46, '慢性萎缩性胃炎伴中度肠化', 'HIGH', 'u_doc', 'HIS-2026-08819', '2026-07-10', '历下区'),
('chr_002', '3708021975****5678', '孙*华', 'F', 51, '结肠多发腺瘤切除术后', 'MEDIUM', 'u_doc', 'HIS-2026-09012', '2026-08-01', '市中区'),
('chr_003', '3708111962****9910', '周*安', 'M', 64, '早期胃癌 ESD 术后', 'CRITICAL', 'u_doc', 'HIS-2026-09145', '2026-08-11', '槐荫区'),
('chr_004', '3708121988****3344', '吴*敏', 'F', 38, '溃疡性结肠炎（缓解期）', 'MEDIUM', 'u_doc', 'HIS-2026-09201', '2026-06-18', '天桥区'),
('chr_005', '3708131970****7788', '郑*平', 'M', 56, '非酒精性脂肪性肝炎', 'HIGH', 'u_doc', 'HIS-2026-09330', '2026-05-22', '历城区'),
('chr_006', '3701021968****2211', '冯*梅', 'F', 58, '胃溃疡愈合期', 'LOW', 'u_doc', 'HIS-2026-09412', '2026-04-09', '章丘区');

INSERT OR REPLACE INTO sdphm_infectious_reports (id, report_code, patient_name_mask, disease_name, disease_category, source_department, lab_indicator, report_status, reporter_id, reviewer_id, reported_at, created_at) VALUES
('inf_001', 'SD-HB-20260812-001', '赵*强', '乙型病毒性肝炎', '乙类', '检验科', 'HBsAg 阳性 / HBV-DNA 2.1E4 IU/mL', 'PENDING_REVIEW', 'u_doc', NULL, NULL, '2026-08-12 10:18:00'),
('inf_002', 'SD-TB-20260813-002', '周*安', '肺结核（肠结核待排）', '乙类', '消化内科门诊', 'T-SPOT 阳性', 'APPROVED_REPORTED', 'u_doc', 'u_dir', '2026-08-13 16:40:00', '2026-08-13 09:02:00'),
('inf_003', 'SD-AL-20260815-003', '孙*华', '戊型肝炎', '乙类', '消化内镜中心', 'HEV-IgM 阳性', 'PENDING_REVIEW', 'u_doc', NULL, NULL, '2026-08-15 14:22:00'),
('inf_004', 'SD-PW-20260816-004', '吴*敏', '其他感染性腹泻病', '丙类', '急诊消化', '粪便培养产毒性大肠杆菌阳性', 'REJECTED', 'u_doc', 'u_dir', NULL, '2026-08-16 08:11:00');

INSERT OR REPLACE INTO sdphm_followup_tasks (id, chronic_record_id, plan_followup_date, actual_followup_date, followup_method, followup_status, executor_id, clinical_feedback, next_followup_date) VALUES
('fu_001', 'chr_003', '2026-08-18', NULL, 'CLINIC_VISIT', 'PENDING', 'u_nurse', NULL, '2026-11-16'),
('fu_002', 'chr_001', '2026-08-17', NULL, 'PHONE', 'PENDING', 'u_nurse', NULL, '2026-11-15'),
('fu_003', 'chr_002', '2026-08-10', '2026-08-10', 'WECHAT', 'COMPLETED', 'u_nurse', '无便血，遵嘱低脂饮食，预约 11 月肠镜', '2026-11-08'),
('fu_004', 'chr_005', '2026-08-05', NULL, 'PHONE', 'MISSED', 'u_nurse', '两次未接通', '2026-08-20'),
('fu_005', 'chr_004', '2026-08-19', NULL, 'PHONE', 'PENDING', 'u_nurse', NULL, '2026-11-17');

INSERT OR REPLACE INTO sdphm_exchange_jobs (id, dataset, standard, status, records, mapped, failed, last_sync) VALUES
('ex_001', '传染病网络直报卡', 'WS 375.12 / 省平台 v3.2', 'SUCCESS', 128, 128, 0, '2026-08-16 21:00:00'),
('ex_002', '慢病患者档案', 'GB/T 14396 + 省公卫档案', 'PARTIAL', 86, 81, 5, '2026-08-16 21:04:00'),
('ex_003', '早癌筛查队列', '国家癌症中心筛查规范', 'PENDING', 42, 0, 0, NULL),
('ex_004', '随访履约记录', '山东省公卫随访接口', 'SUCCESS', 210, 210, 0, '2026-08-15 22:10:00');

INSERT OR REPLACE INTO sdphm_audit_logs (id, user_id, action_type, resource_target, ip_address, details, created_at) VALUES
('aud_001', 'u_doc', 'REPORT_SUBMIT', 'inf_001', '10.12.8.21', '提交乙肝网报卡', '2026-08-12 10:18:22'),
('aud_002', 'u_dir', 'REPORT_SUBMIT', 'inf_002', '10.12.8.8', '审核通过肺结核直报', '2026-08-13 16:40:11'),
('aud_003', 'u_audit', 'QUERY_PHI', 'chr_003', '10.12.8.90', '审计查询 ESD 术后档案（已脱敏）', '2026-08-16 09:12:00'),
('aud_004', 'u_admin', 'UPDATE_CONFIG', 'ENABLE_AUTO_INFECTIOUS_SYNC', '10.12.1.2', '开启阳性指征自动同步', '2026-08-14 08:00:00'),
('aud_005', 'u_nurse', 'EXPORT', 'followup', '10.12.8.44', '导出今日随访任务清单', '2026-08-17 07:55:00');
