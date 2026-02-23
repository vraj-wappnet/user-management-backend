import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' }),
      login: jest.fn().mockResolvedValue({
        access_token: 'mockToken',
        user: { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return a success message and user data', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        message: 'user created successfully',
        user: { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return a success message and authentication data', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        message: 'Logged in successfully',
        access_token: 'mockToken',
        user: { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should return a success message', async () => {
      const result = await controller.logout();
      expect(result).toEqual({ message: 'Successfully logged out' });
    });
  });
});
