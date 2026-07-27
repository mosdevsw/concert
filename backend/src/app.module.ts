import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { ConcertsModule } from './concerts/concerts.module'
import { PrismaModule } from './prisma/prisma.module'
import { ReservationsModule } from './reservations/reservations.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ConcertsModule,
    ReservationsModule,
  ],
})
export class AppModule {}
