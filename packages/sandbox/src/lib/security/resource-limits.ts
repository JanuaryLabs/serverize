export interface MemoryLimit {
  /** Maximum memory in bytes */
  max: number;
  /** Maximum swap memory in bytes (0 = no swap, -1 = unlimited) */
  swap?: number;
  /** Soft limit in bytes (kernel will try to keep usage below this) */
  reservation?: number;
}

export interface CpuLimit {
  /** CPU quota in microseconds per period (50000 = 50% of one core) */
  quota?: number;
  /** CPU period in microseconds (default: 100000 = 100ms) */
  period?: number;
  /** CPU shares (relative weight, 1024 = 1 core share) */
  shares?: number;
  /** Number of CPUs (e.g., 0.5 = half a core, 2 = two cores) */
  cpus?: number;
}

export interface PidLimit {
  /** Maximum number of processes/threads */
  max: number;
}

export interface ResourceLimits {
  memory?: MemoryLimit;
  cpu?: CpuLimit;
  pids?: PidLimit;
}

export const DEFAULT_RESOURCE_LIMITS: Required<ResourceLimits> = {
  memory: {
    max: 256 * 1024 * 1024, // 256MB
    swap: 0, // No swap
    reservation: 64 * 1024 * 1024, // 64MB soft limit
  },
  cpu: {
    quota: 50000, // 50% of one core
    period: 100000, // 100ms period
    shares: 512, // Half the default shares
  },
  pids: {
    max: 100, // Max 100 processes
  },
};

export const STRICT_RESOURCE_LIMITS: Required<ResourceLimits> = {
  memory: {
    max: 128 * 1024 * 1024, // 128MB
    swap: 0,
    reservation: 32 * 1024 * 1024,
  },
  cpu: {
    quota: 25000, // 25% of one core
    period: 100000,
    shares: 256,
  },
  pids: {
    max: 50,
  },
};

export const RELAXED_RESOURCE_LIMITS: Required<ResourceLimits> = {
  memory: {
    max: 512 * 1024 * 1024, // 512MB
    swap: 0,
    reservation: 128 * 1024 * 1024,
  },
  cpu: {
    quota: 100000, // 100% of one core
    period: 100000,
    shares: 1024,
  },
  pids: {
    max: 200,
  },
};

export function toDockerHostConfig(
  limits: ResourceLimits,
): Record<string, any> {
  const config: Record<string, any> = {};

  if (limits.memory) {
    config.Memory = limits.memory.max;
    config.MemorySwap = limits.memory.swap ?? 0;
    if (limits.memory.reservation) {
      config.MemoryReservation = limits.memory.reservation;
    }
  }

  if (limits.cpu) {
    if (limits.cpu.quota !== undefined) {
      config.CpuQuota = limits.cpu.quota;
    }
    if (limits.cpu.period !== undefined) {
      config.CpuPeriod = limits.cpu.period;
    }
    if (limits.cpu.shares !== undefined) {
      config.CpuShares = limits.cpu.shares;
    }
    if (limits.cpu.cpus !== undefined) {
      config.NanoCpus = Math.floor(limits.cpu.cpus * 1e9);
    }
  }

  if (limits.pids) {
    config.PidsLimit = limits.pids.max;
  }

  return config;
}
