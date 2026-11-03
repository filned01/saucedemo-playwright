import type { FullConfig, Reporter, TestCase } from '@playwright/test/reporter';

class EnvironmentReporter implements Reporter {
  private readonly environments = new Map<string, string | undefined>();

  onBegin(config: FullConfig): void {
    for (const project of config.projects) {
      const environment = project.metadata?.environment;
      if (typeof environment !== 'string') {
        continue;
      }
      const baseURL =
        typeof project.metadata?.baseURL === 'string'
          ? project.metadata.baseURL
          : project.use.baseURL;
      this.environments.set(environment, baseURL);
    }
  }

  onTestBegin(test: TestCase): void {
    const environment = test.parent.project()?.metadata.environment;
    if (typeof environment !== 'string' || this.environments.has(environment)) {
      return;
    }
    this.environments.set(environment, test.parent.project()?.use.baseURL);
  }

  onEnd(): void {
    if (this.environments.size === 0) {
      return;
    }

    for (const [environment, baseURL] of this.environments) {
      const target = baseURL ? ` (${baseURL})` : '';
      console.log(`The tests were run on ${environment.toUpperCase()} env.${target}`);
    }
  }
}

export default EnvironmentReporter;
