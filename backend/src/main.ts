import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.enableCors()

  const port = process.env.BACKEND_PORT ?? 3001
  await app.listen(port)
}
bootstrap()
