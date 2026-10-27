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
| `npm run typecheck` | Checks TypeScript types without running tests |
| `npm run lint` | Checks TypeScript and JavaScript with ESLint |
| `npm run test:auth` | Authentication only |
| `npm run test:products` | Products page only |
| `npm run test:cart` | Add to cart only |
| `npm run test:checkout` | Checkout only |
| `npm run test:menu` | Burger menu only |
| `npm run report` | Opens the last HTML report |
| `npm run test:debug` | Runs with the Playwright inspector |

Override the target site without editing code:

```powershell
$env:BASE_URL = "https://www.saucedemo.com"
npm test
```

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
