type SecurityEventLevel = "info" | "warn" | "error";

type SecurityEvent = {
  name: string;
  level: SecurityEventLevel;
  payload: Record<string, unknown>;
  timestamp: string;
};

type SecurityTelemetrySink = (event: SecurityEvent) => void;

type DatadogConfig = {
  apiKey: string;
  site: string;
  service: string;
  env: string;
  version: string;
};

const DATADOG_ENABLED = process.env.SECURITY_METRICS_ENABLE_DATADOG === "true";

function consoleSink(event: SecurityEvent) {
  if (event.level === "error") {
    console.error(event.name, event.payload);
    return;
  }

  if (event.level === "warn") {
    console.warn(event.name, event.payload);
    return;
  }

  console.info(event.name, event.payload);
}

function getDatadogConfig(): DatadogConfig | null {
  if (!DATADOG_ENABLED) {
    return null;
  }

  const apiKey = process.env.DD_API_KEY;
  const site = process.env.DD_SITE || "datadoghq.com";

  if (!apiKey || !site) {
    console.warn("security_telemetry_datadog_config_missing", {
      hasApiKey: Boolean(apiKey),
      hasSite: Boolean(site),
    });
    return null;
  }

  return {
    apiKey,
    site,
    service: process.env.DD_SERVICE || "interview-ai-agent",
    env: process.env.DD_ENV || process.env.NODE_ENV || "development",
    version:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.npm_package_version ||
      "unknown",
  };
}

async function sendToDatadog(event: SecurityEvent, config: DatadogConfig) {
  try {
    const endpoint = `https://http-intake.logs.${config.site}/api/v2/logs`;
    const logEntry = {
      ddsource: "nextjs",
      service: config.service,
      env: config.env,
      version: config.version,
      status: event.level,
      message: event.name,
      timestamp: event.timestamp,
      ...event.payload,
    };

    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": config.apiKey,
      },
      body: JSON.stringify([logEntry]),
      keepalive: true,
    });
  } catch (error) {
    console.error("security_telemetry_datadog_emit_failed", {
      errorType: error instanceof Error ? error.name : "unknown_error",
    });
  }
}

function datadogSink(event: SecurityEvent) {
  if (!DATADOG_CONFIG) {
    return;
  }

  void sendToDatadog(event, DATADOG_CONFIG);
}

const sinks: SecurityTelemetrySink[] = [consoleSink];
const DATADOG_CONFIG = getDatadogConfig();

if (DATADOG_CONFIG) {
  sinks.push(datadogSink);
}

export function emitSecurityEvent(
  name: string,
  level: SecurityEventLevel,
  payload: Record<string, unknown>,
) {
  const event: SecurityEvent = {
    name,
    level,
    payload,
    timestamp: new Date().toISOString(),
  };

  for (const sink of sinks) {
    try {
      sink(event);
    } catch (error) {
      console.error("security_telemetry_sink_failed", {
        sink: sink.name || "anonymous",
        errorType: error instanceof Error ? error.name : "unknown_error",
      });
    }
  }
}
