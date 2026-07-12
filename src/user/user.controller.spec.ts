import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    resetPassword: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('resetPassword', () => {
    it('should call userService.resetPassword and return the result', async () => {
      const resetDto = { email: 'test@example.com', newPassword: 'newPassword123' };
      mockUserService.resetPassword.mockResolvedValue({ message: 'Password reset successfully' });

      const result = await controller.resetPassword(resetDto);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockUserService.resetPassword).toHaveBeenCalledWith('test@example.com', 'newPassword123');
    });
  });
});
