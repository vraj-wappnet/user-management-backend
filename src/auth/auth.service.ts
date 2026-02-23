import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User registration failed: Email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const otp = this.generateOtp();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const user = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false,
      });

      await this.mailService.sendOtp(user.email, otp);

      const { password, otp: _, otpExpiresAt: __, ...result } = user as any;
      return {
        ...result,
        message: 'OTP sent to your email. Please verify to complete registration.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new ConflictException('User registration failed: An error occurred while creating the account');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Login failed: User with this email does not exist');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Login failed: Incorrect password');
    }

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.usersService.update(user.id, { otp, otpExpiresAt });
    await this.mailService.sendOtp(user.email, otp);

    return {
      message: 'OTP sent to your email. Please verify to login.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(verifyOtpDto.email);
    if (!user) {
      throw new UnauthorizedException('Verification failed: User not found');
    }

    if (!user.otp || !user.otpExpiresAt || user.otp !== verifyOtpDto.otp) {
      throw new BadRequestException('Verification failed: Invalid OTP');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('Verification failed: OTP expired');
    }

    // Clear OTP and set isVerified to true
    await this.usersService.update(user.id, {
      otp: null,
      otpExpiresAt: null,
      isVerified: true,
    });

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
