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

const transientStatuses = new Set([0, 408, 425, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const isTransientAuthError = (error: unknown) => {
  const maybeError = error as { message?: string; status?: number; name?: string } | null | undefined;
  const message = maybeError?.message?.toLowerCase() ?? "";

  return (
    maybeError?.name === "TypeError" ||
    maybeError?.name === "AuthRetryableFetchError" ||
    transientStatuses.has(Number(maybeError?.status)) ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("connection") ||
    message.includes("database error") ||
    message.includes("temporarily unavailable")
  );
};

/**
 * Fire-and-forget ping that wakes the auth service while the user is still
 * typing, so the real sign-in/sign-up request hits a warm backend.
 */
let warmupPromise: Promise<void> | null = null;
export const warmAuthBackend = () => {
  if (warmupPromise) return warmupPromise;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Promise.resolve();
  warmupPromise = fetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
    .then(() => undefined)
    .catch(() => {
      warmupPromise = null; // allow another attempt later
    });
  return warmupPromise;
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
  { retries = 5, timeoutMs = 12000, initialDelayMs = 800, onRetry }: AuthRetryOptions = {}
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
