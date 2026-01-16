export interface SeccompProfile {
  /** Default action for syscalls not in the filter list */
  defaultAction:
    | 'SCMP_ACT_ALLOW'
    | 'SCMP_ACT_ERRNO'
    | 'SCMP_ACT_KILL'
    | 'SCMP_ACT_TRAP';
  /** Architecture filters (optional) */
  architectures?: string[];
  /** Syscall rules */
  syscalls?: SeccompSyscallRule[];
}

export interface SeccompSyscallRule {
  /** Names of syscalls to match */
  names: string[];
  /** Action to take when matched */
  action:
    | 'SCMP_ACT_ALLOW'
    | 'SCMP_ACT_ERRNO'
    | 'SCMP_ACT_KILL'
    | 'SCMP_ACT_TRAP';
  /** Arguments filter (optional) */
  args?: SeccompArg[];
}

export interface SeccompArg {
  /** Argument index (0-based) */
  index: number;
  /** Value to compare */
  value: number;
  /** Comparison operation */
  op:
    | 'SCMP_CMP_EQ'
    | 'SCMP_CMP_NE'
    | 'SCMP_CMP_LT'
    | 'SCMP_CMP_LE'
    | 'SCMP_CMP_GT'
    | 'SCMP_CMP_GE';
}

export const DOCKER_DEFAULT_SECCOMP = 'default';

export const SECCOMP_UNCONFINED = 'unconfined';

export const AI_EXECUTION_SECCOMP_PROFILE: SeccompProfile = {
  defaultAction: 'SCMP_ACT_ERRNO',
  architectures: ['SCMP_ARCH_X86_64', 'SCMP_ARCH_AARCH64'],
  syscalls: [
    {
      names: [
        'read',
        'write',
        'open',
        'openat',
        'close',
        'stat',
        'fstat',
        'lstat',
        'poll',
        'lseek',
        'pread64',
        'pwrite64',
        'readv',
        'writev',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'mmap',
        'mprotect',
        'munmap',
        'brk',
        'mremap',
        'msync',
        'mincore',
        'madvise',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'getpid',
        'getppid',
        'getuid',
        'geteuid',
        'getgid',
        'getegid',
        'gettid',
        'exit',
        'exit_group',
        'wait4',
        'waitid',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'access',
        'faccessat',
        'getcwd',
        'chdir',
        'fchdir',
        'readlink',
        'readlinkat',
        'dup',
        'dup2',
        'dup3',
        'fcntl',
        'flock',
        'umask',
        'getdents',
        'getdents64',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'nanosleep',
        'clock_nanosleep',
        'clock_gettime',
        'clock_getres',
        'gettimeofday',
        'time',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'rt_sigaction',
        'rt_sigprocmask',
        'rt_sigreturn',
        'sigaltstack',
        'rt_sigsuspend',
        'kill',
        'tgkill',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: ['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork'],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'pipe',
        'pipe2',
        'select',
        'pselect6',
        'epoll_create',
        'epoll_create1',
        'epoll_ctl',
        'epoll_wait',
        'epoll_pwait',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
    {
      names: [
        'ioctl',
        'sched_yield',
        'sched_getaffinity',
        'set_tid_address',
        'set_robust_list',
        'get_robust_list',
        'futex',
        'arch_prctl',
        'prctl',
        'getrandom',
        'prlimit64',
        'getrlimit',
        'setrlimit',
      ],
      action: 'SCMP_ACT_ALLOW',
    },
  ],
};

export function toDockerSecurityOpt(
  profile: SeccompProfile | string,
): string[] {
  if (typeof profile === 'string') {
    if (profile === 'unconfined') {
      return ['seccomp=unconfined'];
    }
    return [];
  }

  return [`seccomp=${JSON.stringify(profile)}`];
}
