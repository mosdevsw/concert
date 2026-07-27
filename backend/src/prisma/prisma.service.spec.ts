import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  it('connects to the database on module init', async () => {
    const service = new PrismaService()
    service.$connect = jest.fn().mockResolvedValue(undefined)

    await service.onModuleInit()

    expect(service.$connect).toHaveBeenCalled()
  })
})
