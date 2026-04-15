import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { emitSecurityEvent } from "@/lib/monitoring/securityTelemetry";

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

export type ComputeRouteId =
  | "coding.execute"
  | "support.chat"
  | "resume.analyze"
  | "speech.analyze";

type ComputeRoutePolicy = {
  routeId: ComputeRouteId;
  maxPayloadBytes: number;
  timeoutMs: number;
  ip: RateLimitPolicy;
  user: RateLimitPolicy;
};

type RateCounter = {
  windowStartMs: number;
  count: number;
  blocked: number;
  highUsageLogged: boolean;
  suspiciousLogged: boolean;
};

type AuthFailureCounter = {
  windowStartMs: number;
  count: number;
  suspiciousLogged: boolean;
};

type MonitoringGlobal = typeof globalThis & {
  __aimockprepRateCounterStore?: Map<string, RateCounter>;
  __aimockprepAuthFailureStore?: Map<string, AuthFailureCounter>;
  __aimockprepUpstashRedisClient?: Redis | null;
  __aimockprepUpstashRedisInitialized?: boolean;
};

const RUNTIME_GLOBAL = globalThis as MonitoringGlobal;
const RATE_COUNTERS =
  RUNTIME_GLOBAL.__aimockprepRateCounterStore ||
  (RUNTIME_GLOBAL.__aimockprepRateCounterStore = new Map<
    string,
    RateCounter
  >());
const AUTH_FAILURE_COUNTERS =
  RUNTIME_GLOBAL.__aimockprepAuthFailureStore ||
  (RUNTIME_GLOBAL.__aimockprepAuthFailureStore = new Map<
    string,
    AuthFailureCounter
  >());

const AUTH_FAILURE_WINDOW_MS = 10 * 60 * 1000;
const AUTH_FAILURE_SUSPICIOUS_THRESHOLD = 12;
const RATE_LIMIT_REDIS_KEY_PREFIX = "security:rate";

const COMPUTE_POLICIES: Record<ComputeRouteId, ComputeRoutePolicy> = {
  "coding.execute": {
    routeId: "coding.execute",
    maxPayloadBytes: 256 * 1024,
    timeoutMs: 15_000,
    ip: { limit: 80, windowMs: 60_000 },
    user: { limit: 40, windowMs: 60_000 },
  },
  "support.chat": {
    routeId: "support.chat",
    maxPayloadBytes: 96 * 1024,
    timeoutMs: 18_000,
    ip: { limit: 50, windowMs: 60_000 },
    user: { limit: 30, windowMs: 60_000 },
  },
  "resume.analyze": {
    routeId: "resume.analyze",
    maxPayloadBytes: 128 * 1024,
    timeoutMs: 25_000,
    ip: { limit: 20, windowMs: 5 * 60_000 },
    user: { limit: 12, windowMs: 5 * 60_000 },
  },
  "speech.analyze": {
    routeId: "speech.analyze",
    maxPayloadBytes: 30 * 1024 * 1024,
    timeoutMs: 60_000,
    ip: { limit: 16, windowMs: 5 * 60_000 },
    user: { limit: 10, windowMs: 5 * 60_000 },
  },
};

type RateLimitBackend = "memory" | "upstash";

type RateConsumeContext = {
  key: string;
  routeId: ComputeRouteId;
  scope: "ip" | "user";
  policy: RateLimitPolicy;
  ip: string;
  userId: string;
  nowMs: number;
};

type RateConsumeResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      response: NextResponse;
    };

type DistributedRateResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  resetMs: number;
};

function getUpstashRedisClient(): Redis | null {
  if (RUNTIME_GLOBAL.__aimockprepUpstashRedisInitialized) {
    return RUNTIME_GLOBAL.__aimockprepUpstashRedisClient || null;
  }

  RUNTIME_GLOBAL.__aimockprepUpstashRedisInitialized = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    RUNTIME_GLOBAL.__aimockprepUpstashRedisClient = null;
    return null;
  }

  try {
    RUNTIME_GLOBAL.__aimockprepUpstashRedisClient = new Redis({
      url,
      token,
    });
  } catch (error) {
    RUNTIME_GLOBAL.__aimockprepUpstashRedisClient = null;
    emitSecurityEvent("security_rate_limit_backend_init_failed", "error", {
      backend: "upstash",
      errorType: error instanceof Error ? error.name : "unknown_error",
    });
  }

  return RUNTIME_GLOBAL.__aimockprepUpstashRedisClient;
}

function getOrInitRateCounter(
  key: string,
  windowMs: number,
  nowMs: number,
): RateCounter {
  const existing = RATE_COUNTERS.get(key);

  if (!existing || nowMs - existing.windowStartMs >= windowMs) {
    const fresh: RateCounter = {
      windowStartMs: nowMs,
      count: 0,
      blocked: 0,
      highUsageLogged: false,
      suspiciousLogged: false,
    };
    RATE_COUNTERS.set(key, fresh);
    return fresh;
  }

  return existing;
}

function getOrInitAuthFailureCounter(
  key: string,
  windowMs: number,
  nowMs: number,
): AuthFailureCounter {
  const existing = AUTH_FAILURE_COUNTERS.get(key);

  if (!existing || nowMs - existing.windowStartMs >= windowMs) {
    const fresh: AuthFailureCounter = {
      windowStartMs: nowMs,
      count: 0,
      suspiciousLogged: false,
    };
    AUTH_FAILURE_COUNTERS.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function getClientIp(
  requestOrHeaders?: NextRequest | { headers: Headers },
): string {
  const headers = requestOrHeaders?.headers;
  if (!headers) {
    return "unknown";
  }

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const xRealIp = headers.get("x-real-ip")?.trim();
  if (xRealIp) {
    return xRealIp;
  }

  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp;
  }

  return "unknown";
}

export function getComputePolicy(routeId: ComputeRouteId): ComputeRoutePolicy {
  return COMPUTE_POLICIES[routeId];
}

export function enforceComputePayloadLimit(
  request: NextRequest,
  routeId: ComputeRouteId,
): NextResponse | null {
  const policy = getComputePolicy(routeId);
  const contentLengthHeader = request.headers.get("content-length")?.trim();

  if (!contentLengthHeader) {
    return null;
  }

  const parsedLength = Number(contentLengthHeader);
  if (!Number.isFinite(parsedLength) || parsedLength < 0) {
    return NextResponse.json(
      { error: "Invalid content length" },
      { status: 400 },
    );
  }

  if (parsedLength > policy.maxPayloadBytes) {
    const ip = getClientIp(request);
    emitSecurityEvent("security_payload_limit_exceeded", "warn", {
      routeId,
      ip,
      contentLength: parsedLength,
      maxPayloadBytes: policy.maxPayloadBytes,
    });

    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  return null;
}

function createRateLimitedResponse(
  windowMs: number,
  metadata?: {
    limit?: number;
    remaining?: number;
    resetMs?: number;
  },
) {
  const retryAfterSeconds = metadata?.resetMs
    ? Math.max(1, Math.ceil((metadata.resetMs - Date.now()) / 1000))
    : Math.max(1, Math.ceil(windowMs / 1000));

  const headers: Record<string, string> = {
    "Retry-After": String(retryAfterSeconds),
  };

  if (typeof metadata?.limit === "number") {
    headers["X-RateLimit-Limit"] = String(metadata.limit);
  }

  if (typeof metadata?.remaining === "number") {
    headers["X-RateLimit-Remaining"] = String(Math.max(0, metadata.remaining));
  }

  if (typeof metadata?.resetMs === "number") {
    headers["X-RateLimit-Reset"] = String(Math.floor(metadata.resetMs / 1000));
  }

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers,
    },
  );
}

async function consumeDistributedRate(
  context: RateConsumeContext,
): Promise<DistributedRateResult | null> {
  const redis = getUpstashRedisClient();
  if (!redis) {
    return null;
  }

  const identifier = context.scope === "ip" ? context.ip : context.userId;
  const bucket = Math.floor(context.nowMs / context.policy.windowMs);
  const ttlSeconds = Math.max(1, Math.ceil(context.policy.windowMs / 1000) + 5);
  const redisKey = `${RATE_LIMIT_REDIS_KEY_PREFIX}:${context.routeId}:${context.scope}:${identifier}:${bucket}`;

  try {
    const rawCount = await redis.incr(redisKey);
    const count = typeof rawCount === "number" ? rawCount : Number(rawCount);

    if (!Number.isFinite(count) || count < 0) {
      throw new Error("distributed counter returned invalid value");
    }

    if (count === 1) {
      await redis.expire(redisKey, ttlSeconds);
    }

    const remaining = Math.max(0, context.policy.limit - count);
    return {
      allowed: count <= context.policy.limit,
      count,
      remaining,
      resetMs: (bucket + 1) * context.policy.windowMs,
    };
  } catch (error) {
    emitSecurityEvent("security_rate_limit_backend_error", "error", {
      backend: "upstash",
      routeId: context.routeId,
      scope: context.scope,
      errorType: error instanceof Error ? error.name : "unknown_error",
    });
    return null;
  }
}

function logHighUsage(params: {
  routeId: ComputeRouteId;
  scope: "ip" | "user";
  ip: string;
  userId: string;
  count: number;
  threshold: number;
  windowMs: number;
  limit: number;
  backend: RateLimitBackend;
}) {
  emitSecurityEvent("security_high_frequency_api_usage", "warn", params);
}

function logRateLimitExceeded(params: {
  routeId: ComputeRouteId;
  scope: "ip" | "user";
  ip: string;
  userId: string;
  count: number;
  limit: number;
  blockedInWindow: number;
  windowMs: number;
  backend: RateLimitBackend;
}) {
  emitSecurityEvent("security_rate_limit_exceeded", "warn", params);
}

function logSuspiciousApiPattern(params: {
  routeId: ComputeRouteId;
  scope: "ip" | "user";
  ip: string;
  userId: string;
  blockedInWindow: number;
  windowMs: number;
  backend: RateLimitBackend;
}) {
  emitSecurityEvent("security_suspicious_api_pattern", "error", params);
}

function consumeRateInMemory(context: RateConsumeContext): RateConsumeResult {
  const counter = getOrInitRateCounter(
    context.key,
    context.policy.windowMs,
    context.nowMs,
  );
  counter.count += 1;

  const highUsageThreshold = Math.max(1, Math.ceil(context.policy.limit * 0.8));
  if (!counter.highUsageLogged && counter.count >= highUsageThreshold) {
    counter.highUsageLogged = true;
    logHighUsage({
      routeId: context.routeId,
      scope: context.scope,
      ip: context.ip,
      userId: context.userId,
      count: counter.count,
      threshold: highUsageThreshold,
      windowMs: context.policy.windowMs,
      limit: context.policy.limit,
      backend: "memory",
    });
  }

  if (counter.count > context.policy.limit) {
    counter.blocked += 1;
    logRateLimitExceeded({
      routeId: context.routeId,
      scope: context.scope,
      ip: context.ip,
      userId: context.userId,
      count: counter.count,
      limit: context.policy.limit,
      blockedInWindow: counter.blocked,
      windowMs: context.policy.windowMs,
      backend: "memory",
    });

    if (counter.blocked >= 3 && !counter.suspiciousLogged) {
      counter.suspiciousLogged = true;
      logSuspiciousApiPattern({
        routeId: context.routeId,
        scope: context.scope,
        ip: context.ip,
        userId: context.userId,
        blockedInWindow: counter.blocked,
        windowMs: context.policy.windowMs,
        backend: "memory",
      });
    }

    return {
      allowed: false,
      response: createRateLimitedResponse(context.policy.windowMs, {
        limit: context.policy.limit,
        remaining: 0,
        resetMs: counter.windowStartMs + context.policy.windowMs,
      }),
    };
  }

  return { allowed: true };
}

async function consumeRate(
  context: RateConsumeContext,
): Promise<RateConsumeResult> {
  const distributedResult = await consumeDistributedRate(context);

  if (!distributedResult) {
    return consumeRateInMemory(context);
  }

  const counter = getOrInitRateCounter(
    context.key,
    context.policy.windowMs,
    context.nowMs,
  );
  counter.count = Math.max(counter.count, distributedResult.count);

  const highUsageThreshold = Math.max(1, Math.ceil(context.policy.limit * 0.8));
  if (!counter.highUsageLogged && counter.count >= highUsageThreshold) {
    counter.highUsageLogged = true;
    logHighUsage({
      routeId: context.routeId,
      scope: context.scope,
      ip: context.ip,
      userId: context.userId,
      count: counter.count,
      threshold: highUsageThreshold,
      windowMs: context.policy.windowMs,
      limit: context.policy.limit,
      backend: "upstash",
    });
  }

  if (!distributedResult.allowed) {
    counter.blocked += 1;
    logRateLimitExceeded({
      routeId: context.routeId,
      scope: context.scope,
      ip: context.ip,
      userId: context.userId,
      count: distributedResult.count,
      limit: context.policy.limit,
      blockedInWindow: counter.blocked,
      windowMs: context.policy.windowMs,
      backend: "upstash",
    });

    if (counter.blocked >= 3 && !counter.suspiciousLogged) {
      counter.suspiciousLogged = true;
      logSuspiciousApiPattern({
        routeId: context.routeId,
        scope: context.scope,
        ip: context.ip,
        userId: context.userId,
        blockedInWindow: counter.blocked,
        windowMs: context.policy.windowMs,
        backend: "upstash",
      });
    }

    return {
      allowed: false,
      response: createRateLimitedResponse(context.policy.windowMs, {
        limit: context.policy.limit,
        remaining: distributedResult.remaining,
        resetMs: distributedResult.resetMs,
      }),
    };
  }

  return { allowed: true };
}

export async function enforceComputeRateLimit(
  request: NextRequest,
  routeId: ComputeRouteId,
  userId: string,
): Promise<NextResponse | null> {
  const policy = getComputePolicy(routeId);
  const nowMs = Date.now();
  const ip = getClientIp(request);
  const normalizedUserId = userId || "unknown_user";

  const ipKey = `${routeId}:ip:${ip}`;
  const ipResult = await consumeRate({
    key: ipKey,
    routeId,
    scope: "ip",
    policy: policy.ip,
    ip,
    userId: normalizedUserId,
    nowMs,
  });
  if (!ipResult.allowed) {
    return ipResult.response;
  }

  const userKey = `${routeId}:user:${normalizedUserId}`;
  const userResult = await consumeRate({
    key: userKey,
    routeId,
    scope: "user",
    policy: policy.user,
    ip,
    userId: normalizedUserId,
    nowMs,
  });
  if (!userResult.allowed) {
    return userResult.response;
  }

  return null;
}

export function recordFailedAuthAttempt(params: {
  request?: NextRequest;
  routeId: string;
  reason: "missing_session" | "invalid_session" | "auth_service_unavailable";
}) {
  const nowMs = Date.now();
  const ip = getClientIp(params.request);
  const counterKey = `${params.routeId}:${ip}`;
  const counter = getOrInitAuthFailureCounter(
    counterKey,
    AUTH_FAILURE_WINDOW_MS,
    nowMs,
  );

  counter.count += 1;

  emitSecurityEvent("security_failed_auth_attempt", "warn", {
    routeId: params.routeId,
    ip,
    reason: params.reason,
    failuresInWindow: counter.count,
    windowMs: AUTH_FAILURE_WINDOW_MS,
  });

  if (
    counter.count >= AUTH_FAILURE_SUSPICIOUS_THRESHOLD &&
    !counter.suspiciousLogged
  ) {
    counter.suspiciousLogged = true;
    emitSecurityEvent("security_suspicious_auth_pattern", "error", {
      routeId: params.routeId,
      ip,
      failuresInWindow: counter.count,
      windowMs: AUTH_FAILURE_WINDOW_MS,
    });
  }
}

export class OperationTimeoutError extends Error {
  timeoutMs: number;

  constructor(operationName: string, timeoutMs: number) {
    super(`${operationName} timed out`);
    this.name = "OperationTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export async function withOperationTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new OperationTimeoutError(operationName, timeoutMs));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function isOperationTimeoutError(
  error: unknown,
): error is OperationTimeoutError {
  return error instanceof OperationTimeoutError;
}
