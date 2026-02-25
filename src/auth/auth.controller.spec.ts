import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        message: 'OTP sent to your email. Please verify to complete registration.',
      }),
      login: jest.fn().mockResolvedValue({
        message: 'Logged in successfully',
        access_token: 'mockToken',
        user: { id: 'uuid-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', isVerified: true },
      }),
      verifyOtp: jest.fn().mockResolvedValue({
        message: 'Verified successfully',
        access_token: 'mockToken',
        user: { id: 'uuid-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
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
        id: 'uuid-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        message: 'OTP sent to your email. Please verify to complete registration.',
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return a success message indicating OTP sent', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        message: 'Logged in successfully',
        access_token: 'mockToken',
        user: { id: 'uuid-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', isVerified: true },
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('verifyOtp', () => {
    it('should return authentication data when OTP is verified', async () => {
      const verifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      const result = await controller.verifyOtp(verifyOtpDto);

      expect(result).toEqual({
        message: 'Verified successfully',
        access_token: 'mockToken',
        user: { id: 'uuid-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      });
      expect(authService.verifyOtp).toHaveBeenCalledWith(verifyOtpDto);
    });
  });

  describe('logout', () => {
    it('should return a success message', async () => {
      const result = await controller.logout();
      expect(result).toEqual({ message: 'Successfully logged out' });
    });
  });
});
