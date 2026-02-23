import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let mailService: Partial<MailService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };
    mailService = {
      sendOtp: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and send OTP', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 'uuid-1',
        ...registerDto,
        password: 'hashedPassword',
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.email).toEqual(registerDto.email);
      expect(result.message).toContain('OTP sent');
      expect(mailService.sendOtp).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'uuid-1', email: 'test@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should send OTP for login with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.message).toContain('OTP sent');
      expect(usersService.update).toHaveBeenCalled();
      expect(mailService.sendOtp).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return access token', async () => {
      const verifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        otp: '123456',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.verifyOtp(verifyOtpDto);

      expect(result).toBeDefined();
      expect(result.access_token).toEqual('mockToken');
      expect(usersService.update).toHaveBeenCalledWith('uuid-1', {
        otp: null,
        otpExpiresAt: null,
        isVerified: true,
      });
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      const verifyOtpDto = {
        email: 'test@example.com',
        otp: 'wrong',
      };

      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        otp: '123456',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired OTP', async () => {
      const verifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        otp: '123456',
        otpExpiresAt: new Date(Date.now() - 5 * 60 * 1000),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(BadRequestException);
    });
  });
});
