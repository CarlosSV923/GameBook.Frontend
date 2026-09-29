export const serviceWarmupAlertDurationMs = 30_000;

export type ServiceWarmupAlertSnapshot = Readonly<{
  visible: boolean;
}>;

const subscribers = new Set<() => void>();
const activeServices = new Set<string>();
const dismissalTimers = new Map<string, ReturnType<typeof setTimeout>>();
const emptySnapshot: ServiceWarmupAlertSnapshot = { visible: false };
let snapshot: ServiceWarmupAlertSnapshot = emptySnapshot;

export function reportHealthcheckFirstFailure(serviceUrl: string): void {
  if (activeServices.has(serviceUrl)) {
    return;
  }

  activeServices.add(serviceUrl);
  const timer = setTimeout(() => {
    activeServices.delete(serviceUrl);
    dismissalTimers.delete(serviceUrl);
    publishSnapshot();
  }, serviceWarmupAlertDurationMs);

  if (typeof timer === "object" && timer !== null && "unref" in timer) {
    (timer as { unref: () => void }).unref();
  }

  dismissalTimers.set(serviceUrl, timer);
  publishSnapshot();
}

export function reportHealthcheckRecovery(serviceUrl: string): void {
  if (!activeServices.delete(serviceUrl)) {
    return;
  }

  const timer = dismissalTimers.get(serviceUrl);

  if (timer) {
    clearTimeout(timer);
    dismissalTimers.delete(serviceUrl);
  }

  publishSnapshot();
}

export function dismissServiceWarmupAlert(): void {
  for (const timer of dismissalTimers.values()) {
    clearTimeout(timer);
  }

  dismissalTimers.clear();
  activeServices.clear();
  publishSnapshot();
}

export function subscribeToServiceWarmupAlert(
  listener: () => void,
): () => void {
  subscribers.add(listener);

  return () => subscribers.delete(listener);
}

export function getServiceWarmupAlertSnapshot(): ServiceWarmupAlertSnapshot {
  return snapshot;
}

export function getServerServiceWarmupAlertSnapshot(): ServiceWarmupAlertSnapshot {
  return emptySnapshot;
}

function publishSnapshot(): void {
  snapshot = { visible: activeServices.size > 0 };
  subscribers.forEach((listener) => listener());
}
