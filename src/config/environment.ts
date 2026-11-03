import fs from 'node:fs';
import path from 'node:path';
import environmentConfig from '../../config/environments.json';

export const ENVIRONMENTS = ['qa', 'dev', 'prod'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type BrowserName = (typeof BROWSERS)[number];

export type EnvironmentSelection = Environment | 'all';

const AUTH_DIR = path.join(process.cwd(), '.auth');
const DOT_ENV_PATH = path.join(process.cwd(), '.env');

/**
 * Loads `.env` into `process.env` without overriding variables already set
 * by the shell or CI. Safe to call more than once.
 */
export function loadDotEnv(filePath: string = DOT_ENV_PATH): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function isEnvironment(value: string): value is Environment {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}

export function isBrowserName(value: string): value is BrowserName {
  return (BROWSERS as readonly string[]).includes(value);
}

export function isEnvironmentSelection(value: string): value is EnvironmentSelection {
  return value === 'all' || isEnvironment(value);
}

/** Resolves TEST_ENV, then environments.json `testEnv`, defaulting to qa. */
export function resolveRequestedEnvironment(): string {
  return (process.env.TEST_ENV ?? environmentConfig.testEnv ?? 'qa').toLowerCase();
}

export function selectEnvironments(selection: string = resolveRequestedEnvironment()): Environment[] {
  if (selection === 'all') {
    return [...ENVIRONMENTS];
  }

  if (isEnvironment(selection)) {
    return [selection];
  }

  throw new Error(
    `Invalid TEST_ENV "${process.env.TEST_ENV ?? environmentConfig.testEnv}". Choose qa, dev, prod, or all.`,
  );
}

export function resolveBaseUrl(environment: Environment): string | undefined {
  const fromFile = environmentConfig[environment]?.url?.trim() || undefined;

  switch (environment) {
    case 'qa':
      return process.env.QA_BASE_URL ?? process.env.BASE_URL ?? fromFile;
    case 'dev':
      return process.env.DEV_BASE_URL ?? process.env.BASE_URL ?? fromFile;
    case 'prod':
      return process.env.PROD_BASE_URL ?? fromFile;
  }
}

export function getAuthDir(): string {
  return AUTH_DIR;
}

/** Per-environment + browser storage state for the standard shopper. */
export function getAuthStatePath(environment: string, browser: string): string {
  return path.join(AUTH_DIR, `${environment}-${browser}-standard.json`);
}

export function envBaseUrlVarName(environment: Environment): string {
  return `${environment.toUpperCase()}_BASE_URL`;
}

/** Reads `--project` / `-p` flags so global setup only auths browsers that will run. */
export function projectFiltersFromArgv(argv: string[] = process.argv): string[] {
  const filters: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--project' || arg === '-p') {
      const value = argv[index + 1];
      if (value) {
        filters.push(value);
      }
      continue;
    }
    if (arg.startsWith('--project=')) {
      filters.push(arg.slice('--project='.length));
    }
  }

  return filters;
}

export function projectMatchesFilters(projectName: string, filters: string[]): boolean {
  if (filters.length === 0) {
    return true;
  }

  return filters.some((filter) => {
    if (projectName === filter) {
      return true;
    }
    try {
      return new RegExp(filter).test(projectName);
    } catch {
      return false;
    }
  });
}
