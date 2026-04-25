type RetryableResult = {
  error?: {
    message?: string;
    status?: number;
    name?: string;
  } | null;
};

type AuthRetryOptions = {
  retries?: number;
  timeoutMs?: number;
  initialDelayMs?: number;
  onRetry?: (attempt: number) => void;
};

const transientStatuses = new Set([408, 425, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const isTransientAuthError = (error: unknown) => {
  const maybeError = error as { message?: string; status?: number; name?: string } | null | undefined;
  const message = maybeError?.message?.toLowerCase() ?? "";

  return (
    maybeError?.name === "TypeError" ||
    transientStatuses.has(Number(maybeError?.status)) ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("temporarily unavailable")
  );
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("Authentication request timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

export const runAuthRequest = async <T extends RetryableResult>(
  request: () => Promise<T>,
  { retries = 4, timeoutMs = 15000, initialDelayMs = 700, onRetry }: AuthRetryOptions = {}
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await withTimeout(request(), timeoutMs);

      if (result?.error && isTransientAuthError(result.error) && attempt < retries) {
        lastError = result.error;
        onRetry?.(attempt + 1);
        await sleep(initialDelayMs * 2 ** attempt);
        continue;
      }

      return result;
    } catch (error) {
      lastError = error;

      if (!isTransientAuthError(error) || attempt >= retries) {
        throw error;
      }

      onRetry?.(attempt + 1);
      await sleep(initialDelayMs * 2 ** attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Authentication request failed");
};

export const authErrorMessage = (error: unknown, fallback = "Authentication failed. Please try again.") => {
  const maybeError = error as { message?: string; status?: number } | null | undefined;

  if (!navigator.onLine) {
    return "You appear to be offline. Reconnect to the internet and try again.";
  }

  if (isTransientAuthError(error)) {
    return "The authentication service is still starting or temporarily unreachable. Please wait a moment and try again.";
  }

  if (maybeError?.status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  return maybeError?.message || fallback;
};
