# SauceDemo Playwright framework

Automated UI tests for the public Sauce Demo shop at [https://www.saucedemo.com/](https://www.saucedemo.com/).

The suite covers authentication, the products catalog, add to cart, checkout, and the burger menu. Tests are written with Playwright and TypeScript, organized with the Page Object Model, and driven by JSON files in `test-data/`.

## Open this folder in Visual Studio Code

1. Open Visual Studio Code.
2. Choose **File → Open Folder**.
3. Select the `saucedemo-playwright` project folder containing this README.

You can also double-click `saucedemo-playwright.code-workspace`.

Install the recommended **Playwright Test for VS Code** extension when Visual Studio Code prompts you. It adds the test explorer, headed runs, and trace viewing.

## Prerequisites

- Node.js 20.19 or newer (Node.js 22 is used in CI)
- Network access to `https://www.saucedemo.com`

## Setup

From this folder:

```powershell
npm install
npx playwright install chromium firefox webkit
```

## Run the tests

```powershell
npm test
```

Useful variants:

| Command | What it does |
| --- | --- |
| `npm run test:headed` | Runs in a visible browser |
| `npm run test:ui` | Opens the Playwright UI runner |
| `npm run test:qa` | Runs on QA (the default SauceDemo URL unless overridden) |
| `npm run test:dev` | Runs on DEV |
| `npm run test:prod` | Runs on PROD |
| `npm run test:all` | Runs on QA, DEV, and PROD across all browsers |
| `npm run test:smoke` | Runs only tests tagged `@smoke` |
| `npm run test:chromium` | QA on Chromium only (fast local default) |
| `npm run typecheck` | Checks TypeScript types without running tests |
| `npm run lint` | Checks TypeScript and JavaScript with ESLint |
| `npm run test:auth` | Authentication only |
| `npm run test:products` | Products page only |
| `npm run test:cart` | Add to cart only |
| `npm run test:checkout` | Checkout only |
| `npm run test:menu` | Burger menu only |
| `npm run report` | Opens the last HTML report |
| `npm run test:debug` | Runs with the Playwright inspector |

Copy [`.env.example`](./.env.example) to `.env` if you prefer env-file overrides (shell/CI variables still win). Configure default URLs in [`config/environments.json`](./config/environments.json). All environments currently default to the public SauceDemo URL; change the URLs there to target your own environments:

```json
{
  "qa": { "url": "https://qa.example.com" },
  "dev": { "url": "https://dev.example.com" },
  "prod": { "url": "https://www.example.com" }
}
```

Environment variables can still override the file values:

```powershell
$env:QA_BASE_URL = "https://qa.example.com"
$env:DEV_BASE_URL = "https://dev.example.com"
$env:PROD_BASE_URL = "https://www.example.com"
npm run test:dev
```

Choose `npm run test:qa`, `npm run test:dev`, or `npm run test:prod` to run a single environment, or `npm run test:all` to run the full browser matrix against all three. Each target must serve the same UI and test accounts expected by this suite. For compatibility, `BASE_URL` remains an alias for the QA URL; `QA_BASE_URL` takes precedence.

### Choose an environment in VS Code

Set `testEnv` in `config/environments.json` to `qa`, `dev`, `prod`, or `all`. The default is `qa`. Open the **Testing** view, use the Playwright project selector to check the environment/browser projects you want (for example, `qa-chromium`), then run the selected tests. For example, to run only DEV:

```json
{ "testEnv": "dev" }
```

Reload the tests after changing `config/environments.json`. When a run finishes, the terminal prints each environment and base URL that ran (for example, `The tests were run on DEV env. (https://…)`). An environment without a configured URL fails immediately with a clear missing-URL message.

Signed-in flows reuse auth storage created once per environment in global setup (`.auth/`). Auth specs still exercise the real login form. Playwright closes each test’s browser context automatically after failure artifacts are collected; CI also clears `.auth` in global teardown.

## Reports

Every `npm test` writes:

- `playwright-report/index.html` — HTML report with traces, screenshots, and videos for failures
- `test-results/junit-results.xml` — JUnit XML for CI tools

Open the HTML report with `npm run report`. Both folders are gitignored because they are generated output.

## Where to read next

- [Framework structure and design patterns](docs/FRAMEWORK.md)
- [Test case list](docs/TEST_CASES.md)
- [Assumptions and limitations](docs/ASSUMPTIONS_AND_LIMITATIONS.md)

## CI

`.github/workflows/playwright.yml` type-checks and lints the project, then runs the suite on Chromium, Firefox, and WebKit in parallel on Ubuntu. Each browser job uploads its HTML report and test results. It runs on push, pull request, and manual dispatch.
