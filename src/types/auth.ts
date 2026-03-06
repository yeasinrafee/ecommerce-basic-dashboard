export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthenticatedUser = {
  id: string
  email: string
  role: string
  name: string
  image: string | null
}

export type LoginCredentials = {
  email: string
  password: string
}


export type AuthData = {
  user: AuthenticatedUser
  tokens: AuthTokens
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
  errors: unknown[]
  meta: Record<string, unknown>
}
