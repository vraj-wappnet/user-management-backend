import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...registerDto,
        password: 'hashedPassword',
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.email).toEqual(registerDto.email);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toEqual('mockToken');
      expect(result.user.email).toEqual(loginDto.email);
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
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
