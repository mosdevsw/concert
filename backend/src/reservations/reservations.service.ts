import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(userId: string, concertId: string) {
    const concert = await this.prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        _count: { select: { reservations: { where: { status: 'RESERVED' } } } },
      },
    })
    if (!concert || concert.deletedAt)
      throw new NotFoundException('Concert not found')

    const available = concert.totalSeats - concert._count.reservations
    if (available <= 0) throw new BadRequestException('Concert is fully booked')

    const existing = await this.prisma.reservation.findUnique({
      where: { userId_concertId: { userId, concertId } },
    })

    if (existing?.status === 'RESERVED')
      throw new ConflictException('Already reserved this concert')

    return this.prisma.$transaction(async (tx) => {
      const reservation = existing
        ? await tx.reservation.update({
            where: { userId_concertId: { userId, concertId } },
            data: { status: 'RESERVED' },
          })
        : await tx.reservation.create({
            data: { userId, concertId },
          })

      await tx.reservationActivity.create({
        data: { userId, concertId, action: 'RESERVE' },
      })

      return reservation
    })
  }

  async cancel(userId: string, concertId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { userId_concertId: { userId, concertId } },
    })
    if (!reservation || reservation.status === 'CANCELLED')
      throw new NotFoundException('Active reservation not found')

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { userId_concertId: { userId, concertId } },
        data: { status: 'CANCELLED' },
      })

      await tx.reservationActivity.create({
        data: { userId, concertId, action: 'CANCEL' },
      })

      return updated
    })
  }

  async getMyReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId, status: 'RESERVED' },
      include: { concert: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAllReservations() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        concert: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getActivityHistory() {
    return this.prisma.reservationActivity.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        concert: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
