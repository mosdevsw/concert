import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { ReservationsService } from './reservations.service'

describe('ReservationsService', () => {
  let service: ReservationsService
  const tx = {
    reservation: { update: jest.fn(), create: jest.fn() },
    reservationActivity: { create: jest.fn() },
  }
  const prisma = {
    concert: { findUnique: jest.fn() },
    reservation: { findUnique: jest.fn(), findMany: jest.fn() },
    reservationActivity: { findMany: jest.fn() },
    $transaction: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    prisma.$transaction.mockImplementation((cb) => cb(tx))
    const module = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()
    service = module.get(ReservationsService)
  })

  describe('reserve', () => {
    it('throws NotFound when concert missing', async () => {
      prisma.concert.findUnique.mockResolvedValue(null)

      await expect(service.reserve('u1', 'c1')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it('throws BadRequest when concert is fully booked', async () => {
      prisma.concert.findUnique.mockResolvedValue({
        totalSeats: 2,
        _count: { reservations: 2 },
      })

      await expect(service.reserve('u1', 'c1')).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })

    it('throws Conflict when already reserved', async () => {
      prisma.concert.findUnique.mockResolvedValue({
        totalSeats: 5,
        _count: { reservations: 1 },
      })
      prisma.reservation.findUnique.mockResolvedValue({ status: 'RESERVED' })

      await expect(service.reserve('u1', 'c1')).rejects.toBeInstanceOf(
        ConflictException,
      )
    })

    it('re-reserves a cancelled reservation and logs RESERVE activity', async () => {
      prisma.concert.findUnique.mockResolvedValue({
        totalSeats: 5,
        _count: { reservations: 1 },
      })
      prisma.reservation.findUnique.mockResolvedValue({ status: 'CANCELLED' })
      tx.reservation.update.mockResolvedValue({ id: 'r1', status: 'RESERVED' })

      const result = await service.reserve('u1', 'c1')

      expect(tx.reservation.update).toHaveBeenCalledWith({
        where: { userId_concertId: { userId: 'u1', concertId: 'c1' } },
        data: { status: 'RESERVED' },
      })
      expect(tx.reservationActivity.create).toHaveBeenCalledWith({
        data: { userId: 'u1', concertId: 'c1', action: 'RESERVE' },
      })
      expect(result).toEqual({ id: 'r1', status: 'RESERVED' })
    })

    it('creates a new reservation and logs RESERVE activity', async () => {
      prisma.concert.findUnique.mockResolvedValue({
        totalSeats: 5,
        _count: { reservations: 0 },
      })
      prisma.reservation.findUnique.mockResolvedValue(null)
      tx.reservation.create.mockResolvedValue({ id: 'r2', status: 'RESERVED' })

      const result = await service.reserve('u1', 'c1')

      expect(tx.reservation.create).toHaveBeenCalledWith({
        data: { userId: 'u1', concertId: 'c1' },
      })
      expect(tx.reservationActivity.create).toHaveBeenCalled()
      expect(result).toEqual({ id: 'r2', status: 'RESERVED' })
    })
  })

  describe('cancel', () => {
    it('throws NotFound when no reservation exists', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null)

      await expect(service.cancel('u1', 'c1')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it('throws NotFound when reservation already cancelled', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ status: 'CANCELLED' })

      await expect(service.cancel('u1', 'c1')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it('cancels an active reservation and logs CANCEL activity', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ status: 'RESERVED' })
      tx.reservation.update.mockResolvedValue({ id: 'r1', status: 'CANCELLED' })

      const result = await service.cancel('u1', 'c1')

      expect(tx.reservation.update).toHaveBeenCalledWith({
        where: { userId_concertId: { userId: 'u1', concertId: 'c1' } },
        data: { status: 'CANCELLED' },
      })
      expect(tx.reservationActivity.create).toHaveBeenCalledWith({
        data: { userId: 'u1', concertId: 'c1', action: 'CANCEL' },
      })
      expect(result).toEqual({ id: 'r1', status: 'CANCELLED' })
    })
  })

  describe('queries', () => {
    it('getMyReservations returns only RESERVED of the user', async () => {
      prisma.reservation.findMany.mockResolvedValue([])

      await service.getMyReservations('u1')

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', status: 'RESERVED' },
        }),
      )
    })

    it('getAllReservations returns the list', async () => {
      prisma.reservation.findMany.mockResolvedValue([{ id: 'r1' }])

      expect(await service.getAllReservations()).toEqual([{ id: 'r1' }])
    })

    it('getActivityHistory returns the log', async () => {
      prisma.reservationActivity.findMany.mockResolvedValue([{ id: 'a1' }])

      expect(await service.getActivityHistory()).toEqual([{ id: 'a1' }])
    })
  })
})
