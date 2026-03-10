import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'
import type { User } from '../types/campaign.types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@procurea.pl',
  name: 'Test User',
  plan: 'full',
  isPhoneVerified: true,
  onboardingCompleted: true,
  organizationId: 'org-1',
} as User

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isImpersonated: false,
      isLoading: false,
      error: null,
      sessionValidated: false,
    })
  })

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isImpersonated).toBe(false)
    expect(state.sessionValidated).toBe(false)
  })

  it('setUser authenticates user', () => {
    useAuthStore.getState().setUser(mockUser)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.error).toBeNull()
  })

  it('setUser with null logs out', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setUser(null)
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('updateUser merges partial updates', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().updateUser({ name: 'Updated Name', plan: 'research' })
    const state = useAuthStore.getState()
    expect(state.user?.name).toBe('Updated Name')
    expect(state.user?.plan).toBe('research')
    expect(state.user?.email).toBe('test@procurea.pl')
  })

  it('updateUser does nothing when no user', () => {
    useAuthStore.getState().updateUser({ name: 'Nobody' })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('logout clears all auth state', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setImpersonated(true)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isImpersonated).toBe(false)
  })

  it('setImpersonated sets impersonation flag', () => {
    useAuthStore.getState().setImpersonated(true)
    expect(useAuthStore.getState().isImpersonated).toBe(true)
    useAuthStore.getState().setImpersonated(false)
    expect(useAuthStore.getState().isImpersonated).toBe(false)
  })

  it('markSessionValidated sets flag', () => {
    useAuthStore.getState().markSessionValidated()
    expect(useAuthStore.getState().sessionValidated).toBe(true)
  })

  it('setLoading and setError work correctly', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    useAuthStore.getState().setError('Something went wrong')
    expect(useAuthStore.getState().error).toBe('Something went wrong')
    useAuthStore.getState().setError(null)
    expect(useAuthStore.getState().error).toBeNull()
  })
})
