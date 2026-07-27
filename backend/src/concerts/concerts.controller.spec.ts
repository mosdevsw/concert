import { Test } from '@nestjs/testing'
import { ConcertsController } from './concerts.controller'
import { ConcertsService } from './concerts.service'

describe('ConcertsController', () => {
  let controller: ConcertsController
  const concertsService = {
    findAll: jest.fn(),
    getStats: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [{ provide: ConcertsService, useValue: concertsService }],
    }).compile()
    controller = module.get(ConcertsController)
  })

  it('delegates findAll', async () => {
    concertsService.findAll.mockResolvedValue([{ id: 'c1' }])
    expect(await controller.findAll()).toEqual([{ id: 'c1' }])
    expect(concertsService.findAll).toHaveBeenCalled()
  })

  it('delegates getStats', async () => {
    concertsService.getStats.mockResolvedValue({ totalSeats: 1 })
    expect(await controller.getStats()).toEqual({ totalSeats: 1 })
    expect(concertsService.getStats).toHaveBeenCalled()
  })

  it('delegates create', async () => {
    const dto = { name: 'A', description: 'd', totalSeats: 5 }
    concertsService.create.mockResolvedValue({ id: 'c1', ...dto })
    await controller.create(dto)
    expect(concertsService.create).toHaveBeenCalledWith(dto)
  })

  it('delegates remove', async () => {
    concertsService.remove.mockResolvedValue({ id: 'c1' })
    await controller.remove('c1')
    expect(concertsService.remove).toHaveBeenCalledWith('c1')
  })
})
