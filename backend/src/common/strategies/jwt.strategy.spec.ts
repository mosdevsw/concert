import { ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'

describe('JwtStrategy', () => {
  it('returns the payload from validate', () => {
    const config = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService
    const strategy = new JwtStrategy(config)

    const payload = { sub: 'u1', email: 'a@b.com', role: 'USER' }

    expect(strategy.validate(payload)).toEqual(payload)
  })
})
