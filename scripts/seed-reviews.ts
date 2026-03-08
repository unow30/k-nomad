/**
 * 작업공간 리뷰 시드 스크립트
 * Supabase Service Role Key를 사용하여 현실적인 테스트 리뷰 데이터를 생성합니다.
 *
 * 전제조건:
 * - seed:users 스크립트로 user001@test.ai ~ user050@test.ai 가 생성되어 있어야 함
 * - seed-images 버킷에 이미지 파일이 업로드되어 있어야 함
 *
 * 사용법:
 * 1. .env에 SUPABASE_SERVICE_ROLE_KEY 설정 확인
 * 2. npm run seed:reviews 실행
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, basename } from 'path'

// .env 파일 로드 (.env.local 우선)
config({ path: resolve(process.cwd(), '.env.local') })
// config({ path: resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n📋 환경 변수 확인:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ 환경 변수가 설정되지 않았습니다.')
  console.error('💡 .env 파일에 다음 변수들이 설정되어 있는지 확인하세요:')
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

// ───────────────────────────────────────────────
// 한국어 더미 텍스트 (6개 문단)
// ───────────────────────────────────────────────
const LOREM_TEXT = `
카페 분위기가 정말 좋았습니다, 조용하고 집중하기 좋은 환경이었어요, 와이파이 속도가 빠르고 안정적이었습니다, 콘센트가 충분히 마련되어 있어 충전 걱정이 없었어요.
음료 가격이 합리적이고 맛도 훌륭했습니다, 직원분들이 친절하게 응대해 주셔서 편안했어요, 좌석 간격이 넓어서 프라이버시가 잘 지켜지는 편이었습니다.
낮 시간대에 방문했는데 적당히 조용해서 작업하기 딱 좋았어요, 창가 자리에서 자연광을 받으며 일할 수 있어서 정말 좋았습니다, 배경 음악도 작업을 방해하지 않는 수준이었어요.
화장실이 깔끔하게 관리되고 있었고, 주차 공간도 넉넉한 편이었습니다, 근처에 편의시설이 많아서 점심 해결도 편리했어요, 대중교통으로도 접근하기 쉬운 위치였습니다.
작업 공간이 넓고 다양한 좌석 옵션이 있었습니다, 개인 부스 형태의 좌석이 있어 화상 통화도 가능했어요, 화이트보드와 회의 공간도 잘 갖춰져 있었습니다.
전반적으로 매우 만족스러운 경험이었습니다, 다음에도 꼭 다시 방문하고 싶은 공간이에요, 노마드 생활을 하는 분들께 강력히 추천드립니다, 장기 체류 시 멤버십 혜택도 알아보시길 권장합니다.
소음 수준이 적당해서 집중력 유지에 도움이 됐어요, 에어컨 온도 조절이 잘 되어 있어서 쾌적한 환경이었습니다, 간식류도 판매하고 있어서 중간중간 에너지 보충이 가능했어요.
실내 인테리어가 세련되고 아늑한 느낌을 줬습니다, 테이블 표면이 넓어서 여러 기기를 동시에 올려놓고 작업할 수 있었어요, 조명이 눈에 피로감을 주지 않아서 장시간 작업에도 편했습니다.
`.trim()

// 쉼표/마침표/개행으로 분리 후 7자 이상인 구 필터링
const PHRASES = LOREM_TEXT.split(/[,.\n]/)
  .map((s) => s.trim())
  .filter((s) => s.length >= 7)

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 50~200자 사이의 리뷰 본문 생성 */
function generateContent(): string {
  const shuffled = [...PHRASES].sort(() => Math.random() - 0.5)
  let result = ''
  for (const phrase of shuffled) {
    const next = result ? `${result}, ${phrase}` : phrase
    if (next.length > 200) break
    result = next
    if (result.length >= 50) break
  }
  // 50자 미만이면 더 추가 (순환)
  if (result.length < 50) {
    for (const phrase of PHRASES) {
      if (result.length >= 50) break
      result = result ? `${result}, ${phrase}` : phrase
    }
  }
  // 200자 초과 시 자름
  return result.length > 200 ? result.slice(0, 197) + '...' : result
}

/** 리뷰 제목 생성 (PHRASES 중 하나, 최대 50자) */
function generateTitle(): string {
  const phrase = randomElement(PHRASES)
  return phrase.length > 50 ? phrase.slice(0, 47) + '...' : phrase
}

/** 최근 2년 내 무작위 날짜 (YYYY-MM-DD) */
function randomRecentDate(): string {
  const now = Date.now()
  const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000
  const ts = twoYearsAgo + Math.random() * (now - twoYearsAgo)
  return new Date(ts).toISOString().split('T')[0]
}

// ───────────────────────────────────────────────
// 데이터 사전 조회
// ───────────────────────────────────────────────

interface SeedImage {
  name: string
  path: string
}

async function fetchSeedImagesRecursive(prefix: string): Promise<SeedImage[]> {
  const { data, error } = await supabase.storage.from('seed-images').list(prefix, { limit: 200 })
  if (error || !data) return []

  const results: SeedImage[] = []
  const IMAGE_EXTS = /\.(jpg|jpeg|png|webp)$/i

  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    if (item.metadata) {
      // 파일 (metadata 존재)
      if (IMAGE_EXTS.test(item.name)) {
        results.push({ name: item.name, path: fullPath })
      }
    } else {
      // 폴더 (metadata 없음) → 재귀 탐색
      const sub = await fetchSeedImagesRecursive(fullPath)
      results.push(...sub)
    }
  }
  return results
}

interface UserRow {
  id: string
  email: string
}

async function fetchUsers(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email')
    .like('email', 'user%@test.ai')

  if (error) {
    console.error('users 조회 실패:', error.message)
    return []
  }
  return data || []
}

interface WorkspaceRow {
  id: string
  name: string
}

async function fetchWorkspaces(): Promise<WorkspaceRow[]> {
  const { data, error } = await supabase.from('workspaces').select('id, name')
  if (error) {
    console.error('workspaces 조회 실패:', error.message)
    return []
  }
  return data || []
}

// ───────────────────────────────────────────────
// 이미지 버킷 간 복사 (seed-images → workspace-review-images)
// ───────────────────────────────────────────────

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

async function copyImage(
  srcPath: string,
  workspaceId: string,
  reviewId: string
): Promise<string | null> {
  // 1. seed-images에서 Blob 다운로드
  const { data: blob, error: downloadError } = await supabase.storage
    .from('seed-images')
    .download(srcPath)

  if (downloadError || !blob) {
    console.warn(`    ⚠️  이미지 다운로드 실패 (${srcPath}): ${downloadError?.message}`)
    return null
  }

  // 2. Blob → Buffer
  const buffer = Buffer.from(await blob.arrayBuffer())

  // 3. 업로드 경로: {workspaceId}/{reviewId}/{timestamp}-{originalFilename}
  const originalName = basename(srcPath)
  const destPath = `${workspaceId}/${reviewId}/${Date.now()}-${originalName}`
  const contentType = getMimeType(originalName)

  // 4. workspace-review-images에 업로드
  const { error: uploadError } = await supabase.storage
    .from('workspace-review-images')
    .upload(destPath, buffer, { contentType, upsert: false })

  if (uploadError) {
    console.warn(`    ⚠️  이미지 업로드 실패 (${destPath}): ${uploadError.message}`)
    return null
  }

  // 5. 공개 URL 반환
  const { data: urlData } = supabase.storage
    .from('workspace-review-images')
    .getPublicUrl(destPath)

  return urlData.publicUrl
}

// ───────────────────────────────────────────────
// 메인 시드 함수
// ───────────────────────────────────────────────

async function seedReviews() {
  console.log('\n🚀 작업공간 리뷰 시드 시작...\n')

  // 데이터 사전 조회 (병렬)
  console.log('📦 데이터 조회 중...')
  const [seedImages, users, workspaces] = await Promise.all([
    fetchSeedImagesRecursive(''),
    fetchUsers(),
    fetchWorkspaces(),
  ])

  console.log(`  seed-images 이미지: ${seedImages.length}장`)
  console.log(`  테스트 유저: ${users.length}명`)
  console.log(`  작업공간: ${workspaces.length}개\n`)

  if (users.length === 0) {
    console.error('❌ 테스트 유저가 없습니다. 먼저 npm run seed:users를 실행하세요.')
    process.exit(1)
  }

  if (workspaces.length === 0) {
    console.error('❌ 작업공간이 없습니다. 먼저 작업공간 데이터를 추가하세요.')
    process.exit(1)
  }

  let totalCreated = 0
  let totalFailed = 0
  let totalImages = 0

  for (const workspace of workspaces) {
    console.log(`\n🏢 [${workspace.name}] 리뷰 생성 중...`)

    const reviewCount = randomInt(3, 8)
    const usedUserIds = new Set<string>()
    let workspaceCreated = 0

    for (let r = 0; r < reviewCount; r++) {
      // 유저 중복 방지 (작업공간별)
      const availableUsers = users.filter((u) => !usedUserIds.has(u.id))
      if (availableUsers.length === 0) {
        console.log('  ℹ️  사용 가능한 유저가 없어 더 이상 리뷰를 생성할 수 없습니다.')
        break
      }

      const user = randomElement(availableUsers)
      usedUserIds.add(user.id)

      const rating = randomInt(1, 5)
      const isRecommended = rating >= 3
      const visitedAt = Math.random() < 0.7 ? randomRecentDate() : null

      // 리뷰 INSERT
      const { data: review, error: reviewError } = await supabase
        .from('workspace_reviews')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          title: generateTitle(),
          content: generateContent(),
          rating,
          is_recommended: isRecommended,
          visited_at: visitedAt,
          has_images: false,
        })
        .select('id')
        .single()

      if (reviewError || !review) {
        console.error(`  ❌ 리뷰 생성 실패 (${user.email}): ${reviewError?.message}`)
        totalFailed++
        continue
      }

      const reviewId = review.id

      // 이미지 처리
      const imageCount = randomInt(0, Math.min(5, seedImages.length))
      let reviewImageCount = 0

      if (imageCount > 0 && seedImages.length > 0) {
        // 이미지 무작위 선택 (중복 없이)
        const shuffledImages = [...seedImages].sort(() => Math.random() - 0.5)
        const selectedImages = shuffledImages.slice(0, imageCount)

        for (let i = 0; i < selectedImages.length; i++) {
          const img = selectedImages[i]
          const publicUrl = await copyImage(img.path, workspace.id, reviewId)

          if (!publicUrl) continue

          // workspace_review_images DB INSERT
          const { error: imgDbError } = await supabase
            .from('workspace_review_images')
            .insert({
              review_id: reviewId,
              image_url: publicUrl,
              caption: null,
              display_order: i,
              file_size: null,
              original_filename: img.name,
            })

          if (imgDbError) {
            console.warn(
              `    ⚠️  이미지 DB 등록 실패 (${img.name}): ${imgDbError.message}`
            )
            continue
          }

          reviewImageCount++
          totalImages++
        }

        // 이미지가 1장이라도 성공 시 has_images 업데이트
        if (reviewImageCount > 0) {
          const { error: updateError } = await supabase
            .from('workspace_reviews')
            .update({ has_images: true })
            .eq('id', reviewId)

          if (updateError) {
            console.warn(`    ⚠️  has_images 업데이트 실패: ${updateError.message}`)
          }
        }
      }

      console.log(
        `  ✅ ${user.email} | ⭐${rating} | 이미지 ${reviewImageCount}장${visitedAt ? ` | 방문 ${visitedAt}` : ''}`
      )
      workspaceCreated++
      totalCreated++
    }

    console.log(`  → 생성 완료: ${workspaceCreated}개`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ 시드 완료!`)
  console.log(`  리뷰 생성: ${totalCreated}개`)
  console.log(`  이미지 업로드: ${totalImages}장`)
  console.log(`  실패: ${totalFailed}개`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (totalFailed > 0) {
    console.error('❌ 일부 리뷰 생성에 실패했습니다. 로그를 확인하세요.')
    process.exit(1)
  }
}

seedReviews()
