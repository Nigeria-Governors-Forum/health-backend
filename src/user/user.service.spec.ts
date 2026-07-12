import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'old-hashed-password' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, password: 'new-hashed-password' });

      const result = await service.resetPassword('test@example.com', 'newPassword123');

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('nonexistent@example.com', 'newPassword123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
