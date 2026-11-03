# Framework structure and test architecture

## Folder layout

```text
saucedemo-playwright/
├── playwright.config.ts      Runner, browsers, reporters, env projects
├── config/
│   └── environments.json     QA, DEV, and PROD base URLs + default testEnv
├── package.json              Dependencies and npm scripts
├── tsconfig.json             Strict TypeScript settings
├── test-data/                External test data (JSON)
│   ├── users.json
│   ├── products.json
│   ├── customers.json
│   ├── messages.json         Auth/checkout copy and About href pattern
│   └── routes.json           Protected paths checked while logged out
├── src/
│   ├── auth/
│   │   ├── global-setup.ts   One login per env → .auth/*-standard.json
│   │   └── global-teardown.ts Clears .auth in CI
│   ├── config/environment.ts Typed env selection and URL resolution
│   ├── fixtures/test.ts      Guest `test` + logged-in `loggedInTest`
│   ├── pages/                Page Object Model
│   │   ├── Header.ts         Cart badge, cart link, page title
│   │   ├── LoginPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── BurgerMenu.ts
│   ├── reporters/
│   │   └── environmentReporter.ts
│   └── utils/
│       ├── models.ts         Types and sort-option values
│       ├── testData.ts       Loads JSON and exposes typed data
│       └── money.ts          Price sums and the 8% tax rule
├── tests/                    Specs, grouped by feature
│   ├── auth.spec.ts          Guest fixtures (real UI login)
│   ├── products.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── burger-menu.spec.ts
├── docs/                     Architecture, cases, assumptions
└── .github/workflows/        CI pipeline
```

Generated folders (`node_modules`, `playwright-report`, `test-results`) are not source.

## Architecture

Tests talk to page objects. Page objects talk to the browser. Test data lives outside the specs.

```text
global setup (once per env)
  → login as standard_user → save .auth/{env}-standard.json

spec file
  → guest `test` or `loggedInTest` (storage state + open inventory)
    → fixture (LoginPage, ProductsPage, CartPage, CheckoutPage, BurgerMenu)
      → page object methods
        → Playwright locators (getByTestId / data-test and stable ids)
          → configured base URL (qa / dev / prod)
```

Each test gets a fresh browser context. Playwright closes that context (and the browser when the worker exits) after screenshots, video, and traces are collected. Logged-in specs import `loggedInTest`, which loads storage state from global setup and opens `/inventory.html` automatically. Auth specs and the problem-user case keep the guest `test` fixture and perform a real UI login.

## Design patterns

### Page Object Model

Each screen (login, products, cart, checkout, burger menu) is a class. Locators sit next to the actions that use them. Specs assert business outcomes (`expectOverview`, `expectOrderComplete`) and do not repeat selectors.

`Header` is a small component object. Products, cart, and checkout all compose it, because the cart badge and title appear on every signed-in screen.

### Fixtures

`src/fixtures/test.ts` extends Playwright’s `test` and injects page objects. A spec lists the objects it needs in the callback arguments. Playwright builds only those objects, and it builds them after the `page` exists. Specs import `test` / `loggedInTest` and `expect` from the fixture file, not from `@playwright/test` directly.

`validateEnvironment` is an auto fixture: if a selected environment has no `baseURL`, the test fails immediately with the env-var name to set. `loggedInTest` also auto-opens the inventory page so signed-in specs skip repetitive `beforeEach` login calls.

### Externalized test data

`test-data/*.json` holds users, the catalog, checkout customers, UI messages, and protected routes. `src/utils/testData.ts` reads those files from the project root and returns typed objects. Specs do not hardcode product prices, usernames, or Epic sadface / checkout error copy. Price-sort bounds come from `catalogPriceBounds()`.

Customer records use obvious fake values (`Fake`, `Person`, `00000`). The shopper accounts are the demo accounts published by the SauceDemo site itself.

### Data-driven checks

Protected routes are listed once and expanded into one test per path. Sort expectations come from the product catalog, not from a second copy of the names inside the spec. Checkout totals are calculated from the same price list the test adds to the cart.

### Arrange, Act, Assert

Each test sets up a user and cart, performs one action, then checks the result. Page-object methods that navigate also wait for the URL that proves the navigation finished, so the spec’s assertions start from a stable page.

## Locator strategy

SauceDemo exposes `data-test` attributes for the controls these tests use. Those attributes are independent of CSS class names. The burger menu is the exception: its items are stable element ids (`#logout_sidebar_link`, `#reset_sidebar_link`, and the others).

Tests do not click by screen coordinates and do not depend on the order of anonymous `div` elements, except where order is the behavior under test (name and price sorting).

## Configuration

`src/config/environment.ts` owns env selection and URL resolution. `playwright.config.ts` consumes it and sets:

- `baseURL` from `config/environments.json`, with `QA_BASE_URL`, `DEV_BASE_URL`, and `PROD_BASE_URL` overrides (`BASE_URL` is still a QA/DEV alias)
- `testEnv` in `config/environments.json` selects `qa`, `dev`, `prod`, or `all` (default `qa`); `TEST_ENV` overrides it via npm scripts
- Optional `.env` loading via `loadDotEnv()` (see `.env.example`)
- `globalSetup` / `globalTeardown` for per-env + per-browser auth under `.auth/`
- Global setup respects `--project` filters so CI can install one browser at a time
- `testIdAttribute: 'data-test'` so page objects can use `getByTestId`
- Stable `locale` / `timezoneId` for consistent CI vs local runs
- Projects named `{env}-{browser}` (for example `qa-chromium`)
- `@smoke` tags for a short critical-path subset (`npm run test:smoke`)
- A custom reporter that prints each environment and its base URL
- Parallel workers locally, two workers and two retries in CI
- `forbidOnly` in CI, HTML + JUnit + list reporters
- Screenshots and video on failure, trace on the first retry

## Reporting

The HTML reporter is the human-readable result. Open `playwright-report/index.html` or run `npm run report`. Failed tests include a screenshot, a video, and (on retry) a trace you can open in Trace Viewer.

The JUnit file at `test-results/junit-results.xml` is there for pipelines that ingest XML. The GitHub Actions workflow uploads both artifacts even when the suite fails, as long as the job was not cancelled.

## CI/CD

`.github/workflows/playwright.yml` runs a quality job and a browser test matrix:

1. Check out the repository.
2. Install Node.js 22 and `npm ci`.
3. Run ESLint and the TypeScript type check.
4. Install each browser and its operating-system dependencies.
5. Run the suite with `TEST_ENV=qa` against `qa-chromium`, `qa-firefox`, and `qa-webkit`.
6. Upload browser-specific HTML reports and test results.

The workflow runs on push to `main` or `master`, on pull requests, and on manual dispatch. It does not deploy the application. SauceDemo is an external site, so the pipeline is a test runner, not a release pipeline.
