import { Test } from '@nestjs/testing'
import { ReservationsController } from './reservations.controller'
import { ReservationsService } from './reservations.service'

describe('ReservationsController', () => {
  let controller: ReservationsController
  const reservationsService = {
    getMyReservations: jest.fn(),
    getAllReservations: jest.fn(),
    getActivityHistory: jest.fn(),
    reserve: jest.fn(),
    cancel: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: reservationsService },
      ],
    }).compile()
    controller = module.get(ReservationsController)
  })

  it('delegates getMyReservations with the user id from the request', async () => {
    reservationsService.getMyReservations.mockResolvedValue([])
    await controller.getMyReservations({ user: { sub: 'u1' } })
    expect(reservationsService.getMyReservations).toHaveBeenCalledWith('u1')
  })

  it('delegates getAllReservations', async () => {
    reservationsService.getAllReservations.mockResolvedValue([])
    await controller.getAllReservations()
    expect(reservationsService.getAllReservations).toHaveBeenCalled()
  })

  it('delegates getActivityHistory', async () => {
    reservationsService.getActivityHistory.mockResolvedValue([])
    await controller.getActivityHistory()
    expect(reservationsService.getActivityHistory).toHaveBeenCalled()
  })

  it('delegates reserve with user id and concert id', async () => {
    reservationsService.reserve.mockResolvedValue({ id: 'r1' })
    await controller.reserve({ user: { sub: 'u1' } }, 'c1')
    expect(reservationsService.reserve).toHaveBeenCalledWith('u1', 'c1')
  })

  it('delegates cancel with user id and concert id', async () => {
    reservationsService.cancel.mockResolvedValue({ id: 'r1' })
    await controller.cancel({ user: { sub: 'u1' } }, 'c1')
    expect(reservationsService.cancel).toHaveBeenCalledWith('u1', 'c1')
  })
})
