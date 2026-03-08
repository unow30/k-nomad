/**
 * 개발 환경용 테스트 유저 대량 생성 스크립트
 * Supabase Admin API를 사용하여 어드민 및 일반 유저를 생성합니다.
 *
 * 생성 목록:
 * - 어드민: admin001@test.ai ~ admin005@test.ai (5명), 역할: admin
 * - 일반유저: user001@test.ai ~ user050@test.ai (50명), 역할: user
 * - 공통 비밀번호: asdf1234
 *
 * 사용법:
 * 1. .env 또는 .env.local에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있는지 확인
 * 2. npm run seed:users 실행
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env 파일 로드 (.env.local 우선)
// config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n📋 환경 변수 확인:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.')
  console.error('💡 .env 또는 .env.local 파일에 다음 변수들이 설정되어 있는지 확인하세요:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const PASSWORD = 'asdf1234'

interface UserConfig {
  email: string
  displayName: string
  role: 'admin' | 'user'
}

function generateUsers(): UserConfig[] {
  const users: UserConfig[] = []

  // 어드민 유저: admin001@test.ai ~ admin005@test.ai
  for (let i = 1; i <= 5; i++) {
    const num = String(i).padStart(3, '0')
    users.push({
      email: `admin${num}@test.ai`,
      displayName: `관리자${num}`,
      role: 'admin',
    })
  }

  // 일반 유저: user001@test.ai ~ user050@test.ai
  for (let i = 1; i <= 50; i++) {
    const num = String(i).padStart(3, '0')
    users.push({
      email: `user${num}@test.ai`,
      displayName: `사용자${num}`,
      role: 'user',
    })
  }

  return users
}

async function createUser(user: UserConfig): Promise<'created' | 'skipped' | 'failed'> {
  try {
    // 1. Auth 유저 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: user.displayName,
      },
    })

    if (authError) {
      // 이미 존재하는 경우
      if (authError.message.includes('already been registered') || authError.status === 422) {
        console.log(`  ⏭️  ${user.email} - 이미 존재 (건너뜀)`)
        return 'skipped'
      }
      console.error(`  ❌ ${user.email} - Auth 생성 실패: ${authError.message}`)
      return 'failed'
    }

    const userId = authData.user.id

    // 2. 어드민은 role 업데이트 (트리거가 자동으로 public.users 생성하지만 role='user'로 설정됨)
    if (user.role === 'admin') {
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (roleError) {
        console.error(`  ⚠️  ${user.email} - role 업데이트 실패: ${roleError.message}`)
        // role 업데이트 실패해도 Auth 유저는 생성됐으므로 생성은 성공으로 처리
      }
    }

    console.log(`  ✅ ${user.email} (${user.role})`)
    return 'created'
  } catch (err) {
    console.error(`  ❌ ${user.email} - 예외 발생:`, err)
    return 'failed'
  }
}

async function seedUsers() {
  console.log('\n🚀 테스트 유저 대량 생성 시작...\n')
  console.log('📋 생성 계획:')
  console.log('  어드민: admin001@test.ai ~ admin005@test.ai (5명)')
  console.log('  일반유저: user001@test.ai ~ user050@test.ai (50명)')
  console.log(`  비밀번호: ${PASSWORD}\n`)

  const users = generateUsers()
  let created = 0
  let skipped = 0
  let failed = 0

  // 어드민 유저 생성
  console.log('👤 어드민 유저 생성 중...')
  for (const user of users.filter((u) => u.role === 'admin')) {
    const result = await createUser(user)
    if (result === 'created') created++
    else if (result === 'skipped') skipped++
    else failed++
  }

  // 일반 유저 생성
  console.log('\n👥 일반 유저 생성 중...')
  for (const user of users.filter((u) => u.role === 'user')) {
    const result = await createUser(user)
    if (result === 'created') created++
    else if (result === 'skipped') skipped++
    else failed++
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ 완료!`)
  console.log(`  생성: ${created}명 / 건너뜀: ${skipped}명 / 실패: ${failed}명`)
  console.log(`  비밀번호: ${PASSWORD}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (failed > 0) {
    console.error('❌ 일부 유저 생성에 실패했습니다. 로그를 확인하세요.')
    process.exit(1)
  }
}

seedUsers()
