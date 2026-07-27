import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'
import { PrismaService } from './prisma.service'

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get('ADMIN_EMAIL', 'admin@concert.com')

    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) return

    const password = this.config.get('ADMIN_PASSWORD', 'admin1234')
    const hashed = await argon2.hash(password)

    await this.prisma.user.create({
      data: { name: 'Admin', email, password: hashed, role: 'ADMIN' },
    })

    this.logger.log(`Seeded default admin: ${email}`)
  }
}
