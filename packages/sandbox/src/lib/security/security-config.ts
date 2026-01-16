import {
  DEFAULT_RESOURCE_LIMITS,
  type ResourceLimits,
  STRICT_RESOURCE_LIMITS,
  toDockerHostConfig,
} from './resource-limits.js';
import {
  AI_EXECUTION_SECCOMP_PROFILE,
  DOCKER_DEFAULT_SECCOMP,
  type SeccompProfile,
  toDockerSecurityOpt,
} from './seccomp-profiles.js';

export interface SecurityConfig {
  resourceLimits: ResourceLimits;
  seccompProfile: SeccompProfile | string;
  networkDisabled: boolean;
  readonlyRootfs: boolean;
  /** UID:GID format */
  user: string;
  capDrop: string[];
  timeoutMs: number;
  tmpfsMounts: Record<string, string>;
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  resourceLimits: DEFAULT_RESOURCE_LIMITS,
  seccompProfile: DOCKER_DEFAULT_SECCOMP,
  networkDisabled: true,
  readonlyRootfs: true,
  user: '65534:65534', // nobody:nogroup
  capDrop: ['ALL'],
  timeoutMs: 30000, // 30 seconds
  tmpfsMounts: {
    '/tmp': 'rw,noexec,nosuid,size=64m',
    '/run': 'rw,noexec,nosuid,size=16m',
    '/app': 'rw,noexec,nosuid,size=64m',
  },
};

export const STRICT_SECURITY_CONFIG: SecurityConfig = {
  resourceLimits: STRICT_RESOURCE_LIMITS,
  seccompProfile: AI_EXECUTION_SECCOMP_PROFILE,
  networkDisabled: true,
  readonlyRootfs: true,
  user: '65534:65534',
  capDrop: ['ALL'],
  timeoutMs: 60000, // 1 minute
  tmpfsMounts: {
    '/tmp': 'rw,noexec,nosuid,size=32m',
    '/run': 'rw,noexec,nosuid,size=8m',
    '/app': 'rw,noexec,nosuid,size=32m',
  },
};

export class SecurityConfigBuilder {
  #config: Partial<SecurityConfig> = {};

  withResourceLimits(limits: ResourceLimits): this {
    this.#config.resourceLimits = limits;
    return this;
  }

  withSeccompProfile(profile: SeccompProfile | string): this {
    this.#config.seccompProfile = profile;
    return this;
  }

  withNetworkDisabled(disabled: boolean): this {
    this.#config.networkDisabled = disabled;
    return this;
  }

  withReadonlyRootfs(readonly: boolean): this {
    this.#config.readonlyRootfs = readonly;
    return this;
  }

  withUser(user: string): this {
    this.#config.user = user;
    return this;
  }

  withCapDrop(caps: string[]): this {
    this.#config.capDrop = caps;
    return this;
  }

  withTimeout(timeoutMs: number): this {
    this.#config.timeoutMs = timeoutMs;
    return this;
  }

  withTmpfsMounts(mounts: Record<string, string>): this {
    this.#config.tmpfsMounts = mounts;
    return this;
  }

  build(): SecurityConfig {
    return {
      resourceLimits:
        this.#config.resourceLimits ?? DEFAULT_SECURITY_CONFIG.resourceLimits,
      seccompProfile:
        this.#config.seccompProfile ?? DEFAULT_SECURITY_CONFIG.seccompProfile,
      networkDisabled:
        this.#config.networkDisabled ?? DEFAULT_SECURITY_CONFIG.networkDisabled,
      readonlyRootfs:
        this.#config.readonlyRootfs ?? DEFAULT_SECURITY_CONFIG.readonlyRootfs,
      user: this.#config.user ?? DEFAULT_SECURITY_CONFIG.user,
      capDrop: this.#config.capDrop ?? DEFAULT_SECURITY_CONFIG.capDrop,
      timeoutMs: this.#config.timeoutMs ?? DEFAULT_SECURITY_CONFIG.timeoutMs,
      tmpfsMounts:
        this.#config.tmpfsMounts ?? DEFAULT_SECURITY_CONFIG.tmpfsMounts,
    };
  }
}

export function toDockerContainerConfig(
  config: SecurityConfig,
): Record<string, any> {
  const hostConfig = {
    ...toDockerHostConfig(config.resourceLimits),
    ReadonlyRootfs: config.readonlyRootfs,
    CapDrop: config.capDrop,
    Tmpfs: config.tmpfsMounts,
    SecurityOpt: toDockerSecurityOpt(config.seccompProfile),
    AutoRemove: false,
  };

  return {
    User: config.user,
    NetworkDisabled: config.networkDisabled,
    HostConfig: hostConfig,
  };
}
