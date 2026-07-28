import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { ConcertsService } from './concerts.service'

describe('ConcertsService', () => {
  let service: ConcertsService
  const prisma = {
    concert: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    reservation: { count: jest.fn() },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = module.get(ConcertsService)
  })

  describe('findAll', () => {
    it('computes availableSeats from RESERVED count', async () => {
      prisma.concert.findMany.mockResolvedValue([
        {
          id: 'c1',
          name: 'A',
          description: 'd',
          totalSeats: 10,
          createdAt: new Date(),
          _count: { reservations: 3 },
        },
      ])

      const result = await service.findAll()

      expect(result[0].availableSeats).toBe(7)
      expect(result[0].totalSeats).toBe(10)
    })
  })

  describe('create', () => {
    it('creates a concert', async () => {
      const dto = { name: 'A', description: 'd', totalSeats: 5 }
      prisma.concert.create.mockResolvedValue({ id: 'c1', ...dto })

      await service.create(dto)

      expect(prisma.concert.create).toHaveBeenCalledWith({ data: dto })
    })
  })

  describe('remove', () => {
    it('soft-deletes by setting deletedAt when concert exists', async () => {
      prisma.concert.findUnique.mockResolvedValue({ id: 'c1', deletedAt: null })
      prisma.concert.update.mockResolvedValue({ id: 'c1' })

      await service.remove('c1')

      expect(prisma.concert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })

    it('throws NotFound when concert missing', async () => {
      prisma.concert.findUnique.mockResolvedValue(null)

      await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.concert.update).not.toHaveBeenCalled()
    })

    it('throws NotFound when concert already deleted', async () => {
      prisma.concert.findUnique.mockResolvedValue({
        id: 'c1',
        deletedAt: new Date(),
      })

      await expect(service.remove('c1')).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(prisma.concert.update).not.toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('returns total seats and current reserve/cancel counts', async () => {
      prisma.concert.aggregate.mockResolvedValue({ _sum: { totalSeats: 100 } })
      prisma.reservation.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2)

      const result = await service.getStats()

      expect(result).toEqual({ totalSeats: 100, reserveCount: 5, cancelCount: 2 })
    })

    it('defaults total seats to 0 when no concerts', async () => {
      prisma.concert.aggregate.mockResolvedValue({ _sum: { totalSeats: null } })
      prisma.reservation.count.mockResolvedValue(0)

      const result = await service.getStats()

      expect(result.totalSeats).toBe(0)
    })
  })
})
