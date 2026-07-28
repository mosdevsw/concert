import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateConcertDto } from './dto/create-concert.dto'

@Injectable()
export class ConcertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const concerts = await this.prisma.concert.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { reservations: { where: { status: 'RESERVED' } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return concerts.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      totalSeats: c.totalSeats,
      availableSeats: c.totalSeats - c._count.reservations,
      createdAt: c.createdAt,
    }))
  }

  async create(dto: CreateConcertDto) {
    return this.prisma.concert.create({ data: dto })
  }

  async remove(id: string) {
    const concert = await this.prisma.concert.findUnique({ where: { id } })
    if (!concert || concert.deletedAt)
      throw new NotFoundException('Concert not found')
    return this.prisma.concert.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async getStats() {
    const [totalSeats, reserveCount, cancelCount] = await Promise.all([
      this.prisma.concert.aggregate({
        where: { deletedAt: null },
        _sum: { totalSeats: true },
      }),
      this.prisma.reservation.count({
        where: { status: 'RESERVED', concert: { deletedAt: null } },
      }),
      this.prisma.reservation.count({
        where: { status: 'CANCELLED', concert: { deletedAt: null } },
      }),
    ])

    return {
      totalSeats: totalSeats._sum.totalSeats ?? 0,
      reserveCount,
      cancelCount,
    }
  }
}
