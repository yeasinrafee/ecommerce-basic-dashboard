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

export type AuthResponse = {
  user: AuthenticatedUser
  tokens: AuthTokens
}
