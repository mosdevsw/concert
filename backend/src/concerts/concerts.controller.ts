import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { ConcertsService } from './concerts.service'
import { CreateConcertDto } from './dto/create-concert.dto'

@Controller('concerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  @Roles('USER', 'ADMIN')
  findAll() {
    return this.concertsService.findAll()
  }

  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.concertsService.getStats()
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.concertsService.remove(id)
  }
}
