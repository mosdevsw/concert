import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { ReservationsService } from './reservations.service'

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('me')
  @Roles('USER')
  getMyReservations(@Req() req) {
    return this.reservationsService.getMyReservations(req.user.sub)
  }

  @Get()
  @Roles('ADMIN')
  getAllReservations() {
    return this.reservationsService.getAllReservations()
  }

  @Get('history')
  @Roles('ADMIN')
  getActivityHistory() {
    return this.reservationsService.getActivityHistory()
  }

  @Post(':concertId')
  @Roles('USER')
  reserve(@Req() req, @Param('concertId') concertId: string) {
    return this.reservationsService.reserve(req.user.sub, concertId)
  }

  @Delete(':concertId')
  @Roles('USER')
  cancel(@Req() req, @Param('concertId') concertId: string) {
    return this.reservationsService.cancel(req.user.sub, concertId)
  }
}
