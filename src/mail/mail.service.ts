import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtp(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Verification Code',
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        html: `<b>Your OTP is: ${otp}</b><p>It will expire in 5 minutes.</p>`,
      });
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      // For development purposes, we still log the OTP
      console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);
    }
  }
}
