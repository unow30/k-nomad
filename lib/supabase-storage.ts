import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'workspaces';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'JPG, PNG, WEBP 형식만 지원합니다.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '파일 크기는 5MB 이하여야 합니다.' };
  }

  return { valid: true };
}

/**
 * 제안 이미지 업로드
 */
export async function uploadSuggestionImage(
  supabase: SupabaseClient,
  suggestionId: string,
  file: File
): Promise<{ success: boolean; path?: string; error?: string }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `suggestions/${suggestionId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    return { success: false, error: `업로드 실패: ${error.message}` };
  }

  return { success: true, path: filePath };
}

/**
 * 이미지 삭제
 */
export async function deleteImage(
  supabase: SupabaseClient,
  imagePath: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([imagePath]);

  if (error) {
    return { success: false, error: `삭제 실패: ${error.message}` };
  }

  return { success: true };
}

/**
 * 이미지 복사 (승인 시 suggestions → approved)
 */
export async function copyImageToApproved(
  supabase: SupabaseClient,
  sourcePath: string,
  workspaceId: string
): Promise<{ success: boolean; newPath?: string; publicUrl?: string; error?: string }> {
  const fileName = sourcePath.split('/').pop();
  const newPath = `approved/${workspaceId}/${fileName}`;

  const { error: copyError } = await supabase.storage
    .from(BUCKET_NAME)
    .copy(sourcePath, newPath);

  if (copyError) {
    return { success: false, error: `복사 실패: ${copyError.message}` };
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(newPath);

  return { success: true, newPath, publicUrl: data.publicUrl };
}

/**
 * Storage public URL 조회
 */
export function getPublicUrl(
  supabase: SupabaseClient,
  imagePath: string
): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}
