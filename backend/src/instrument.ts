import * as Sentry from "@sentry/node";

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
      : 0.2,
    integrations: [
      // Prisma client tracing is automatically integrated in modern Sentry Node SDK
      Sentry.prismaIntegration(),
    ],
  });
  console.log(`[Sentry] Initialized for environment: ${process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production"}`);
} else {
  console.log("[Sentry] SENTRY_DSN not provided. Sentry telemetry is running in no-op mode.");
}

export { Sentry };
