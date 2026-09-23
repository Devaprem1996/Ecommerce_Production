import dotenv from "dotenv";
import logger from "../logger/index.js";
import { ApiError } from "../exceptions/api-error.js";

// Lazy-loaded SDK instance
let razorpayInstance: any = null;

function cleanCredential(val?: string): string {
  if (!val) return "";
  return val
    .trim()
    .replace(/^["'{}\s]+|["'{};\s]+$/g, "")
    .trim();
}

/**
 * Validates that Razorpay credentials are configured in the environment.
 * Refuses to serve routes if credentials are missing or placeholders.
 * Never logs credentials or their values.
 */
export function validateRazorpayConfig(): { keyId: string; keySecret: string } {
  // In development, reload dotenv so any updates to .env take effect immediately
  if (process.env.NODE_ENV !== "production") {
    dotenv.config();
  }

  const rawKeyId = process.env.RAZORPAY_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

  const keyId = cleanCredential(rawKeyId);
  const keySecret = cleanCredential(rawKeySecret);

  const missing: string[] = [];

  if (!keyId || keyId.startsWith("{{") || keyId.includes("placeholder")) {
    missing.push("RAZORPAY_KEY_ID");
  }
  if (!keySecret || keySecret.startsWith("{{") || keySecret.includes("placeholder")) {
    missing.push("RAZORPAY_KEY_SECRET");
  }

  if (missing.length > 0) {
    logger.error(
      `[Razorpay Integration Error] Payment provider misconfigured. Missing or unfilled environment variable(s): ${missing.join(
        ", "
      )}`
    );
    throw ApiError.internal(
      "Payment provider misconfigured. Check server environment variables."
    );
  }

  return { keyId, keySecret };
}

/**
 * Get or initialize the official Razorpay SDK instance.
 * Fails fast with clear error if SDK package is missing or misconfigured.
 */
export async function getRazorpayClient(): Promise<any> {
  const { keyId, keySecret } = validateRazorpayConfig();

  // If credentials changed or instance doesn't exist, instantiate freshly
  if (
    !razorpayInstance ||
    razorpayInstance._keyId !== keyId ||
    razorpayInstance._keySecret !== keySecret
  ) {
    try {
      const RazorpayModule = await import("razorpay");
      const RazorpayClass = RazorpayModule.default || RazorpayModule;
      razorpayInstance = new RazorpayClass({
        key_id: keyId,
        key_secret: keySecret,
      });
      razorpayInstance._keyId = keyId;
      razorpayInstance._keySecret = keySecret;
    } catch (error: any) {
      logger.error(
        "[Razorpay SDK Error] Failed to initialize Razorpay SDK. Ensure 'razorpay' package is installed.",
        { errorMessage: error?.message }
      );
      throw ApiError.internal(
        "Payment provider SDK initialization failed. Run 'pnpm --filter ecommerce-backend add razorpay'."
      );
    }
  }

  return razorpayInstance;
}

/**
 * Executes a Razorpay SDK call with bounded exponential backoff (max 2 retries)
 * for network timeouts / 5xx server errors.
 * Rejects immediately without retry for 4xx (400 Bad Request, 401 Unauthorized).
 */
export async function executeWithRetry<T>(
  operation: (client: any) => Promise<T>,
  operationName: string = "Razorpay Operation"
): Promise<T> {
  const client = await getRazorpayClient();
  const maxRetries = 2;
  let attempt = 0;

  while (true) {
    try {
      return await operation(client);
    } catch (err: any) {
      const statusCode = Number(err?.statusCode || err?.status || err?.error?.code);
      const is4xx = statusCode >= 400 && statusCode < 500;
      const is401 = statusCode === 401 || err?.error?.description?.includes("Unauthorized");

      if (is401) {
        razorpayInstance = null; // Invalidate cached instance so fresh credentials are used on next attempt
        logger.error(
          `[Razorpay Error] 401 Unauthorized during ${operationName}. Invalid RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.`
        );
        throw ApiError.internal("Payment provider misconfigured. Please check API credentials.");
      }

      if (is4xx) {
        // 400 Bad Request or other 4xx - do not retry
        const description =
          err?.error?.description ||
          err?.description ||
          err?.message ||
          "Payment gateway rejected the request.";
        logger.warn(`[Razorpay Bad Request] ${operationName} returned 400: ${description}`);
        throw ApiError.badRequest(description);
      }

      // Check if network error or 5xx
      attempt++;
      if (attempt > maxRetries) {
        logger.error(
          `[Razorpay Gateway Error] ${operationName} failed after ${maxRetries} retries: ${err?.message}`
        );
        throw ApiError.serviceUnavailable(
          "Payment gateway is temporarily unavailable. Please retry in a few moments."
        );
      }

      const backoffMs = Math.pow(2, attempt) * 500; // 1s, 2s
      logger.warn(
        `[Razorpay Retry] ${operationName} encountered temporary error (${err?.message}). Retrying attempt ${attempt}/${maxRetries} in ${backoffMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}
