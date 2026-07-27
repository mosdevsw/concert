import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import * as argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { AuthService } from './auth.service'

jest.mock('argon2')

describe('AuthService', () => {
  let service: AuthService
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
  }
  const jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile()
    service = module.get(AuthService)
  })

  describe('register', () => {
    it('hashes password, creates user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      ;(argon2.hash as jest.Mock).mockResolvedValue('hashed')
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: 'USER',
      })

      const result = await service.register({
        name: 'A',
        email: 'a@b.com',
        password: 'secret1',
      })

      expect(argon2.hash).toHaveBeenCalledWith('secret1')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'A', email: 'a@b.com', password: 'hashed' },
      })
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'a@b.com',
        role: 'USER',
      })
      expect(result).toEqual({ access_token: 'signed.jwt.token' })
    })

    it('throws ConflictException when email already used', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' })

      await expect(
        service.register({ name: 'A', email: 'a@b.com', password: 'secret1' }),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('returns token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: 'ADMIN',
        password: 'hashed',
      })
      ;(argon2.verify as jest.Mock).mockResolvedValue(true)

      const result = await service.login({
        email: 'a@b.com',
        password: 'secret1',
      })

      expect(argon2.verify).toHaveBeenCalledWith('hashed', 'secret1')
      expect(result).toEqual({ access_token: 'signed.jwt.token' })
    })

    it('throws Unauthorized when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(
        service.login({ email: 'x@b.com', password: 'p' }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('throws Unauthorized when password invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hashed' })
      ;(argon2.verify as jest.Mock).mockResolvedValue(false)

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })
  })
})
