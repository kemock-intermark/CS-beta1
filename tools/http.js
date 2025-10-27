// Simple HTTP helper with timeout and retries
export async function fetchWithTimeout(url, options = {}, timeout = 5000, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && error.name !== 'AbortError') {
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    throw error;
  }
}

export async function isPortOpen(host, port) {
  try {
    const response = await fetchWithTimeout(`http://${host}:${port}`, { method: 'HEAD' }, 2000, 0);
    return true;
  } catch {
    return false;
  }
}

export async function waitForPort(host, port, maxAttempts = 30, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    const open = await isPortOpen(host, port);
    if (open) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

