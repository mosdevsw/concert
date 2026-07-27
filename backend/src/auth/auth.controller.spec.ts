import { Test } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  const authService = { register: jest.fn(), login: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile()
    controller = module.get(AuthController)
  })

  it('delegates register to the service', async () => {
    const dto = { name: 'A', email: 'a@b.com', password: 'secret1' }
    authService.register.mockResolvedValue({ access_token: 't' })

    expect(await controller.register(dto)).toEqual({ access_token: 't' })
    expect(authService.register).toHaveBeenCalledWith(dto)
  })

  it('delegates login to the service', async () => {
    const dto = { email: 'a@b.com', password: 'secret1' }
    authService.login.mockResolvedValue({ access_token: 't' })

    expect(await controller.login(dto)).toEqual({ access_token: 't' })
    expect(authService.login).toHaveBeenCalledWith(dto)
  })
})
