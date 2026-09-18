-- ====================================================================
-- SCHOLAR HUB SUPABASE SEED DATA (10 REAL INDIAN SCHOLARSHIPS & NOTIFICATIONS)
-- ====================================================================

INSERT INTO public.scholarships (id, title, description, amount_monthly, deadline, category_eligible, level, status)
VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000001',
  'National Fellowship for ST Students (NFST)',
  'Ministry of Tribal Affairs flagship fellowship for ST students pursuing M.Phil and Ph.D. in humanities, sciences, and engineering across recognized Indian universities.',
  37000,
  '2026-10-31',
  ARRAY['ST'],
  'PhD',
  'active'
),
(
  'a1b2c3d4-0002-4000-8000-000000000002',
  'Post-Matric Scholarship for ST Students (Jharkhand & PAN-India)',
  'Financial assistance for ST students studying at post-secondary or post-matriculation stage to enable them to complete higher education.',
  10000,
  '2026-11-15',
  ARRAY['ST'],
  'Post-Matric',
  'active'
),
(
  'a1b2c3d4-0003-4000-8000-000000000003',
  'Pre-Matric Tribal Scholarship Scheme',
  'Centrally sponsored scheme for tribal students studying in classes IX and X to minimize drop-outs and encourage transition to secondary education.',
  3500,
  '2026-09-30',
  ARRAY['ST'],
  'Pre-Matric',
  'active'
),
(
  'a1b2c3d4-0004-4000-8000-000000000004',
  'National Overseas Scholarship for ST Candidates',
  'Provides financial support to selected ST candidates for pursuing Master level courses, Ph.D. and Post-Doctoral research programs abroad.',
  125000,
  '2026-12-15',
  ARRAY['ST'],
  'PhD',
  'active'
),
(
  'a1b2c3d4-0005-4000-8000-000000000005',
  'Prime Minister Research Fellowship (PMRF)',
  'Designed for improving the quality of research in higher educational institutions in India. Offers direct Ph.D. admission and lucrative fellowship.',
  70000,
  '2026-11-30',
  ARRAY['ST', 'SC', 'OBC', 'General', 'Minority'],
  'PhD',
  'active'
),
(
  'a1b2c3d4-0006-4000-8000-000000000006',
  'Central Sector Scheme of Scholarships for University Students (NSP)',
  'MHRD scheme to provide financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.',
  2000,
  '2026-10-15',
  ARRAY['ST', 'SC', 'OBC', 'General', 'Minority'],
  'UG',
  'active'
),
(
  'a1b2c3d4-0007-4000-8000-000000000007',
  'Ishan Uday Special Scholarship Scheme for North Eastern Region',
  'UGC special scholarship for students belonging to NER states pursuing general degree courses, technical and professional courses.',
  7800,
  '2026-10-25',
  ARRAY['ST', 'SC', 'OBC', 'General', 'Minority'],
  'UG',
  'active'
),
(
  'a1b2c3d4-0008-4000-8000-000000000008',
  'AICTE Pragati Scholarship for Girl Students',
  'Assistance for girl students pursuing technical education degrees or diplomas in AICTE approved institutions across India.',
  5000,
  '2026-11-10',
  ARRAY['ST', 'SC', 'OBC', 'General', 'Minority'],
  'UG',
  'active'
),
(
  'a1b2c3d4-0009-4000-8000-000000000009',
  'Maulana Azad National Fellowship (MANF)',
  'Five-year fellowship provided to minority students (Muslim, Christian, Sikh, Buddhist, Parsi, Jain) to pursue M.Phil and Ph.D.',
  31000,
  '2026-12-01',
  ARRAY['Minority'],
  'PhD',
  'active'
),
(
  'a1b2c3d4-0010-4000-8000-000000000010',
  'Top Class Education Scheme for SC/ST Students',
  'Covers full tuition fees and living expenses for meritorious SC/ST students studying in premier institutions like IITs, NITs, and IIMs.',
  15000,
  '2026-11-20',
  ARRAY['ST', 'SC'],
  'UG',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  amount_monthly = EXCLUDED.amount_monthly,
  deadline = EXCLUDED.deadline,
  category_eligible = EXCLUDED.category_eligible,
  level = EXCLUDED.level,
  status = EXCLUDED.status;
