import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user from the request', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockRequest = { user: mockUser };
      
      const result = controller.getProfile(mockRequest);
      
      expect(result).toEqual(mockUser);
    });
  });
});

