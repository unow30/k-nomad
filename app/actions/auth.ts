'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * 로그인 Server Action
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorMessage = encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다')
    redirect(`/login?error=${errorMessage}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * 회원가입 Server Action
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.log('error is::',error)
    const errorMessage = encodeURIComponent('회원가입에 실패했습니다. 다시 시도해주세요')
    redirect(`/register?error=${errorMessage}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * 로그아웃 Server Action
 */
export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/?error=로그아웃에 실패했습니다')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
