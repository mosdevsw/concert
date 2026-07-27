import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'
import { PrismaService } from './prisma.service'
import { SeedService } from './seed.service'

jest.mock('argon2')

describe('SeedService', () => {
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
  } as unknown as PrismaService
  const config = {
    get: jest.fn((_key: string, def: string) => def),
  } as unknown as ConfigService

  beforeEach(() => jest.clearAllMocks())

  it('skips creation when admin already exists', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'a1' })
    const service = new SeedService(prisma, config)

    await service.onApplicationBootstrap()

    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('creates default admin when none exists', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(argon2.hash as jest.Mock).mockResolvedValue('hashed')
    const service = new SeedService(prisma, config)

    await service.onApplicationBootstrap()

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Admin',
        email: 'admin@concert.com',
        password: 'hashed',
        role: 'ADMIN',
      },
    })
  })
})
