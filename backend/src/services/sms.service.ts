import logger from "../logger/index.js";
import {
  analyzeSms,
  sanitizeToGsm7,
  enforceSingleSegmentLimit,
} from "../utils/sms-char-counter.js";

export interface SendOtpOptions {
  phone: string;
  otp: string;
  purpose?: string;
}

export interface SendOrderSmsOptions {
  phone: string;
  orderNumber: string;
  grandTotal: string | number;
  trackingUrl?: string;
}

export interface SendPaymentSmsOptions {
  phone: string;
  orderNumber: string;
  amount: string | number;
  trackingUrl?: string;
}

export interface SendDeliverySmsOptions {
  phone: string;
  orderNumber: string;
  customerName?: string;
  trackingUrl?: string;
}

// Default production Fast2SMS Quick Route API key (backed by wallet credits)
const DEFAULT_FAST2SMS_KEY =
  "AvI5Y2Qyp7MXKEz1oxSZtaL8qOuRmrfb6Ns4U9gCDGPBHkdTcjtpZvBguoeFUKJ9bTGnLDPxCa1k068c";

export class SmsService {
  /**
   * Send 6-digit OTP to mobile number via Fast2SMS Quick SMS / OTP route
   * Strictly formatted within 160 GSM-7 English characters for single-credit Rs. 5 cost
   */
  static async sendOtp(options: SendOtpOptions): Promise<boolean> {
    const { phone, otp, purpose = "Verification" } = options;
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const apiKey = (process.env.FAST2SMS_API_KEY || DEFAULT_FAST2SMS_KEY).trim();
    const isMock = apiKey.toLowerCase() === "mock";

    // Standard GSM-7 English message (70 characters, strictly 1 segment = Rs. 5)
    const rawMessage = `Your Yathu Arokiyagam verification code is ${otp}. Valid for 5 minutes.`;
    const message = enforceSingleSegmentLimit(rawMessage);
    const analysis = analyzeSms(message);

    if (isMock) {
      logger.info(
        `\n==================================================\n` +
        `[MOCK SMS GATEWAY] Sent to: +91${cleanPhone}\n` +
        `Purpose: ${purpose}\n` +
        `OTP Code: >>> ${otp} <<<\n` +
        `Characters: ${analysis.charCount}/160 (GSM-7: ${analysis.isGsm7Compliant})\n` +
        `Cost Estimate: Rs.${analysis.costInr}\n` +
        `Valid for: 5 minutes\n` +
        `==================================================\n`
      );
      return true;
    }

    try {
      const cleanKey = apiKey.trim();
      logger.info(
        `[Fast2SMS] Dispatching OTP [${otp}] to +91${cleanPhone} (${purpose}) | ` +
        `${analysis.charCount}/160 chars | Segments: 1 (Rs.5)`
      );

      // Fast2SMS Quick Route (Single SMS segment)
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: cleanKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message,
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const result: any = await response.json();
      if (result.return === true || result.status_code === 200) {
        logger.info(`[Fast2SMS] Successfully dispatched OTP to +91${cleanPhone}`);
        return true;
      } else {
        logger.warn(
          `[Fast2SMS] Quick route returned: ${result.message || JSON.stringify(result)}. Attempting OTP route fallback...`
        );

        // Fallback to route 'otp' if needed
        const fallbackRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            authorization: cleanKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "otp",
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });

        const fallbackResult: any = await fallbackRes.json();
        if (fallbackResult.return === true || fallbackResult.status_code === 200) {
          logger.info(`[Fast2SMS OTP Route] Successfully dispatched OTP to +91${cleanPhone}`);
          return true;
        } else {
          logger.error(`[Fast2SMS] Failed to send OTP:`, fallbackResult);
          return false;
        }
      }
    } catch (error) {
      logger.error(`[Fast2SMS] Exception while sending SMS to +91${cleanPhone}:`, error);
      return false;
    }
  }

  /**
   * Helper to dispatch Quick SMS via Fast2SMS with mock fallback
   * Strictly enforces English GSM-7 limit of <= 160 characters (Rs. 5 per SMS)
   */
  private static async dispatchQuickSms(
    phone: string,
    rawMessage: string,
    label = "SMS"
  ): Promise<boolean> {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const apiKey = (process.env.FAST2SMS_API_KEY || DEFAULT_FAST2SMS_KEY).trim();
    const isMock = apiKey.toLowerCase() === "mock";

    // Guarantee GSM-7 compliance and <= 160 character ceiling
    const message = enforceSingleSegmentLimit(rawMessage);
    const analysis = analyzeSms(message);

    if (isMock) {
      logger.info(
        `\n==================================================\n` +
        `[MOCK SMS GATEWAY] ${label.toUpperCase()}\n` +
        `Sent to: +91${cleanPhone}\n` +
        `Message: ${message}\n` +
        `Characters: ${analysis.charCount}/160 | GSM-7: ${analysis.isGsm7Compliant} | Cost: Rs.${analysis.costInr}\n` +
        `==================================================\n`
      );
      return true;
    }

    try {
      const cleanKey = apiKey.trim();
      logger.info(
        `[Fast2SMS] Dispatching ${label} to +91${cleanPhone} | ` +
        `${analysis.charCount}/160 chars | Segments: ${analysis.segments} (Rs.${analysis.costInr})`
      );

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: cleanKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message,
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const result: any = await response.json();
      if (result.return === true || result.status_code === 200) {
        logger.info(`[Fast2SMS] Dispatched ${label} to +91${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[Fast2SMS] Failed to send ${label}:`, result);
        return false;
      }
    } catch (error) {
      logger.error(`[Fast2SMS] Exception while sending ${label} to +91${cleanPhone}:`, error);
      return false;
    }
  }

  /**
   * Send Order Received SMS (under 160 GSM-7 characters -> Rs. 5 cost)
   */
  static async sendOrderReceived(options: SendOrderSmsOptions): Promise<boolean> {
    const { phone, orderNumber, grandTotal, trackingUrl } = options;
    const frontendUrl = process.env.FRONTEND_URL || "https://yathuarokiyagam.com";
    const trackLink = trackingUrl || `${frontendUrl}/track-order`;
    const message = `Dear Customer, order #${orderNumber} (Rs.${grandTotal}) received at Yathu Arokiyagam. We are preparing it. Track: ${trackLink}`;
    return this.dispatchQuickSms(phone, message, "Order Received SMS");
  }

  /**
   * Send Payment Confirmed SMS (under 160 GSM-7 characters -> Rs. 5 cost)
   */
  static async sendPaymentConfirmed(options: SendPaymentSmsOptions): Promise<boolean> {
    const { phone, orderNumber, amount, trackingUrl } = options;
    const frontendUrl = process.env.FRONTEND_URL || "https://yathuarokiyagam.com";
    const trackLink = trackingUrl || `${frontendUrl}/track-order`;
    const message = `Dear Customer, payment of Rs.${amount} for order #${orderNumber} is confirmed at Yathu Arokiyagam. Track: ${trackLink}`;
    return this.dispatchQuickSms(phone, message, "Payment Confirmed SMS");
  }

  /**
   * Send Order Delivered SMS (under 160 GSM-7 characters -> Rs. 5 cost)
   */
  static async sendOrderDelivered(options: SendDeliverySmsOptions): Promise<boolean> {
    const { phone, orderNumber } = options;
    const message = `Dear Customer, order #${orderNumber} has been delivered. Thank you for shopping with Yathu Arokiyagam!`;
    return this.dispatchQuickSms(phone, message, "Order Delivered SMS");
  }

  /**
   * Send Order Cancelled & Refund Initiated SMS (under 160 GSM-7 characters -> Rs. 5 cost)
   */
  static async sendOrderCancelled(options: {
    phone: string;
    orderNumber: string;
    refundAmount?: number | string | null;
  }): Promise<boolean> {
    const { phone, orderNumber, refundAmount } = options;
    const refundText =
      refundAmount && Number(refundAmount) > 0
        ? ` Refund of Rs.${refundAmount} initiated (5-7 days).`
        : "";
    const message = `Order #${orderNumber} cancelled.${refundText} Yathu Arokiyagam.`;
    return this.dispatchQuickSms(phone, message, "Order Cancelled SMS");
  }

  /**
   * Backward compatibility
   */
  static async sendOrderConfirmation(options: SendOrderSmsOptions): Promise<boolean> {
    return this.sendOrderReceived(options);
  }
}

