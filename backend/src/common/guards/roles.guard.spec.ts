import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  const contextWith = (user: unknown): ExecutionContext =>
    ({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext

  beforeEach(() => {
    reflector = new Reflector()
    guard = new RolesGuard(reflector)
  })

  it('allows when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    expect(guard.canActivate(contextWith({ role: 'USER' }))).toBe(true)
  })

  it('allows when user role is included', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'])

    expect(guard.canActivate(contextWith({ role: 'ADMIN' }))).toBe(true)
  })

  it('denies when user role is not included', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'])

    expect(guard.canActivate(contextWith({ role: 'USER' }))).toBe(false)
  })

  it('denies when there is no authenticated user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'])

    expect(guard.canActivate(contextWith(undefined))).toBe(false)
  })
})
