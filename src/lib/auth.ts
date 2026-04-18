import { cookies } from 'next/headers'

export async function getLoggedIn(): Promise<boolean> {
  const store = await cookies()
  return !!store.get('ci_session')?.value
}

export async function getUserCookie(): Promise<string | undefined> {
  const store = await cookies()
  return store.get('ci_session')?.value
}
