"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_js_1 = __importDefault(require("../logger/index.js"));
class EmailService {
    static transporter = null;
    /**
     * Lazily initialize and return the Nodemailer transporter
     */
    static getTransporter() {
        if (this.transporter)
            return this.transporter;
        // Check for Gmail App Password Configuration
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            this.transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
                },
            });
            index_js_1.default.info("[EmailService] Initialized Gmail SMTP transport");
            return this.transporter;
        }
        // Check for Generic SMTP (Hostinger / Brevo / Amazon SES / etc.)
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            index_js_1.default.info(`[EmailService] Initialized SMTP transport for ${process.env.SMTP_HOST}`);
            return this.transporter;
        }
        return null;
    }
    /**
     * Send transactional email
     */
    static async sendEmail(options) {
        const transporter = this.getTransporter();
        if (!transporter) {
            index_js_1.default.info(`[EmailService MOCK] Notification queued for ${options.to}: "${options.subject}" (Configure GMAIL_USER & GMAIL_APP_PASSWORD or SMTP credentials in .env to send live emails)`);
            return true;
        }
        try {
            const fromAddress = process.env.GMAIL_USER ||
                process.env.SMTP_FROM ||
                process.env.SMTP_USER ||
                "no-reply@yathuarokiyagam.com";
            await transporter.sendMail({
                from: `"Yathu Arokiyagam" <${fromAddress}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            index_js_1.default.info(`[EmailService] Successfully sent email to ${options.to}: "${options.subject}"`);
            return true;
        }
        catch (error) {
            index_js_1.default.error(`[EmailService] Failed to send email to ${options.to}:`, error);
            return false;
        }
    }
    /**
     * Helper: Send Order Confirmation Email with branded HTML
     */
    static async sendOrderConfirmation(to, orderNumber, grandTotal, customerName = "Customer") {
        const frontendUrl = process.env.FRONTEND_URL || "https://yathuarokiyagam.com";
        const subject = `Order Confirmed #${orderNumber} - Yathu Arokiyagam`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #15803d; margin: 0; font-size: 24px;">Yathu Arokiyagam</h1>
          <p style="color: #4b5563; margin-top: 4px;">Traditional Organic & Cold-Pressed Goodness</p>
        </div>

        <div style="background-color: #f0fdf4; border-left: 4px solid #15803d; padding: 16px; margin-bottom: 20px;">
          <h2 style="color: #166534; margin: 0 0 8px 0; font-size: 18px;">Order Confirmed! 🎉</h2>
          <p style="color: #374151; margin: 0;">Hello <strong>${customerName}</strong>, thank you for your order. We are carefully packing your items with natural care.</p>
        </div>

        <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 6px;">
          <p style="margin: 4px 0; color: #374151;"><strong>Order Number:</strong> #${orderNumber}</p>
          <p style="margin: 4px 0; color: #374151;"><strong>Total Amount:</strong> ₹${grandTotal}</p>
          <p style="margin: 4px 0; color: #374151;"><strong>Status:</strong> Processing & Packed</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${frontendUrl}/track-order" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Track Your Order Live
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
          Questions? Contact our support team via WhatsApp or call us directly.
        </p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
    /**
     * Helper: Send Order Cancellation & Refund Email with branded HTML
     */
    static async sendOrderCancelled(to, orderNumber, refundAmount = null, customerName = "Customer") {
        const subject = `Order Cancelled #${orderNumber} - Yathu Arokiyagam`;
        const refundSection = refundAmount && Number(refundAmount) > 0
            ? `<div style="margin-top: 12px; padding: 12px; background-color: #ecfdf5; border-radius: 6px; border: 1px solid #a7f3d0;">
             <p style="margin: 0; color: #065f46; font-size: 14px;"><strong>Refund Initiated:</strong> ₹${refundAmount} has been refunded to your original payment method. Please allow 5–7 business days for the funds to reflect in your bank account.</p>
           </div>`
            : "";
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #15803d; margin: 0; font-size: 24px;">Yathu Arokiyagam</h1>
          <p style="color: #4b5563; margin-top: 4px;">Traditional Organic & Cold-Pressed Goodness</p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; margin: 0 0 8px 0; font-size: 18px;">Order Cancelled</h2>
          <p style="color: #374151; margin: 0;">Hello <strong>${customerName}</strong>, your order #${orderNumber} has been cancelled.</p>
          ${refundSection}
        </div>

        <p style="color: #4b5563; font-size: 14px;">
          If you have any questions or cancelled by mistake, you can browse our shop to place a new order anytime.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
          Need help? Reach out to support at Yathu Arokiyagam.
        </p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
}
exports.EmailService = EmailService;
