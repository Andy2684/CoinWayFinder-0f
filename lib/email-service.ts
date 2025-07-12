import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Coinwayfinder" <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async sendBotCreationEmail(
    userEmail: string,
    botConfig: any,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #30D5C8 0%, #4F46E5 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🤖 AI Bot Created Successfully!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #30D5C8; margin: 0 0 20px 0;">Your AI Trading Bot is Ready</h2>
          <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
            Your AI-powered trading bot "${botConfig.name}" has been created and is ready to start trading.
          </p>
          
          <div style="background-color: #2a2a2a; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #30D5C8;">Bot Details</h3>
            <div style="margin-bottom: 10px;">
              <span style="color: #cccccc;">Strategy:</span>
              <span style="color: #ffffff; margin-left: 10px;">${botConfig.strategyId}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span style="color: #cccccc;">Investment:</span>
              <span style="color: #ffffff; margin-left: 10px;">$${botConfig.investment}</span>
            </div>
            <div>
              <span style="color: #cccccc;">AI Optimization:</span>
              <span style="color: ${botConfig.aiOptimization ? "#30D5C8" : "#cccccc"}; margin-left: 10px;">
                ${botConfig.aiOptimization ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/bots" style="display: inline-block; background-color: #30D5C8; color: #000000; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold;">
              View Bot Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #888;">
              This is an automated message from Coinwayfinder. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `AI Bot Created: ${botConfig.name}`,
      html,
    });
  }

  async sendTradingAlert(userEmail: string, alert: any): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">⚡ Trading Alert</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #30D5C8; margin: 0 0 15px 0;">${alert.type} Signal</h2>
          <p style="margin: 0 0 15px 0; color: #cccccc;">${alert.message}</p>
          
          <div style="background-color: #2a2a2a; padding: 15px; border-radius: 6px;">
            <div style="margin-bottom: 8px;">
              <span style="color: #cccccc;">Symbol:</span>
              <span style="color: #ffffff; margin-left: 10px;">${alert.symbol}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #cccccc;">Price:</span>
              <span style="color: #ffffff; margin-left: 10px;">$${alert.price}</span>
            </div>
            <div>
              <span style="color: #cccccc;">Confidence:</span>
              <span style="color: #30D5C8; margin-left: 10px;">${alert.confidence}%</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Trading Alert: ${alert.symbol} ${alert.type}`,
      html,
    });
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #30D5C8 0%, #4F46E5 100%); padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Coinwayfinder!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #30D5C8; margin: 0 0 20px 0;">Hello ${userName}!</h2>
          <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
            Thank you for joining Coinwayfinder, the most advanced AI-powered crypto trading platform.
          </p>
          
          <div style="background-color: #2a2a2a; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #30D5C8;">Get Started</h3>
            <ul style="margin: 0; padding-left: 20px; color: #cccccc;">
              <li style="margin-bottom: 8px;">Create your first AI trading bot</li>
              <li style="margin-bottom: 8px;">Set up trading signals and alerts</li>
              <li style="margin-bottom: 8px;">Connect your exchange accounts</li>
              <li>Start automated trading</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="display: inline-block; background-color: #30D5C8; color: #000000; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              Go to Dashboard
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/bots" style="display: inline-block; background-color: transparent; color: #30D5C8; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; border: 2px solid #30D5C8;">
              Create AI Bot
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Welcome to Coinwayfinder - Start AI Trading Today!",
      html,
    });
  }

  async sendVerificationEmail(
    userEmail: string,
    verificationToken: string,
  ): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #30D5C8 0%, #4F46E5 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Verify Your Email</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #30D5C8; margin: 0 0 20px 0;">Almost There!</h2>
          <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
            Please verify your email address to complete your Coinwayfinder account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #30D5C8; color: #000000; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #888; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="color: #30D5C8;">${verificationUrl}</span>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Verify Your Coinwayfinder Account",
      html,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Reset Your Password</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #30D5C8; margin: 0 0 20px 0;">Password Reset Request</h2>
          <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #30D5C8; color: #000000; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #888; text-align: center;">
            If you didn't request this, please ignore this email. The link will expire in 1 hour.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Reset Your Coinwayfinder Password",
      html,
    });
  }
}

export const emailService = new EmailService();
