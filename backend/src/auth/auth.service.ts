import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existing) throw new ConflictException('Email already in use')

    const hashed = await argon2.hash(dto.password)
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    })

    return this.signToken(user.id, user.email, user.role)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await argon2.verify(user.password, dto.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.signToken(user.id, user.email, user.role)
  }

  private signToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    return {
      access_token: this.jwt.sign(payload),
    }
  }
}
