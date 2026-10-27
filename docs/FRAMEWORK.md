# Framework structure and test architecture

## Folder layout

```text
saucedemo-playwright/
├── playwright.config.ts      Runner, browser, reporters, base URL
├── package.json              Dependencies and npm scripts
├── tsconfig.json             Strict TypeScript settings
├── test-data/                External test data (JSON)
│   ├── users.json
│   ├── products.json
│   └── customers.json
├── src/
│   ├── fixtures/test.ts      Playwright fixtures that build page objects
│   ├── pages/                Page Object Model
│   │   ├── Header.ts         Cart badge, cart link, page title
│   │   ├── LoginPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── BurgerMenu.ts
│   └── utils/
│       ├── models.ts         Types and sort-option values
│       ├── testData.ts       Loads JSON and exposes typed data
│       └── money.ts          Price sums and the 8% tax rule
├── tests/                    Specs, grouped by feature
│   ├── auth.spec.ts
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
spec file
  → fixture (LoginPage, ProductsPage, CartPage, CheckoutPage, BurgerMenu)
    → page object methods
      → Playwright locators (data-test and stable ids)
        → https://www.saucedemo.com
```

Each test gets a fresh browser context, so cookies and `sessionStorage` from one test cannot leak into the next. Specs that need a signed-in shopper call `loginPage.loginAs(users.standard)` in `beforeEach`. Authentication specs start from the logged-out login page.

## Design patterns

### Page Object Model

Each screen (login, products, cart, checkout, burger menu) is a class. Locators sit next to the actions that use them. Specs assert business outcomes (`expectOverview`, `expectOrderComplete`) and do not repeat selectors.

`Header` is a small component object. Products, cart, and checkout all compose it, because the cart badge and title appear on every signed-in screen.

### Fixtures

`src/fixtures/test.ts` extends Playwright’s `test` and injects page objects. A spec lists the objects it needs in the callback arguments. Playwright builds only those objects, and it builds them after the `page` exists. Specs import `test` and `expect` from the fixture file, not from `@playwright/test` directly.

### Externalized test data

`test-data/*.json` holds users, the catalog, and checkout customers. `src/utils/testData.ts` reads those files from the project root and returns typed objects. Specs do not hardcode product prices or usernames.

Customer records use obvious fake values (`Fake`, `Person`, `00000`). The shopper accounts are the demo accounts published by the SauceDemo site itself.

### Data-driven checks

Protected routes are listed once and expanded into one test per path. Sort expectations come from the product catalog, not from a second copy of the names inside the spec. Checkout totals are calculated from the same price list the test adds to the cart.

### Arrange, Act, Assert

Each test sets up a user and cart, performs one action, then checks the result. Page-object methods that navigate also wait for the URL that proves the navigation finished, so the spec’s assertions start from a stable page.

## Locator strategy

SauceDemo exposes `data-test` attributes for the controls these tests use. Those attributes are independent of CSS class names. The burger menu is the exception: its items are stable element ids (`#logout_sidebar_link`, `#reset_sidebar_link`, and the others).

Tests do not click by screen coordinates and do not depend on the order of anonymous `div` elements, except where order is the behavior under test (name and price sorting).

## Configuration

`playwright.config.ts` sets:

- `baseURL` from `BASE_URL`, otherwise `https://www.saucedemo.com`
- Chromium desktop as the project under test
- Parallel workers locally, two workers and two retries in CI
- `forbidOnly` in CI so a leftover `test.only` fails the build
- HTML and JUnit reporters, plus the list reporter in the terminal
- Screenshots and video retained on failure, and a trace on the first retry

## Reporting

The HTML reporter is the human-readable result. Open `playwright-report/index.html` or run `npm run report`. Failed tests include a screenshot, a video, and (on retry) a trace you can open in Trace Viewer.

The JUnit file at `test-results/junit-results.xml` is there for pipelines that ingest XML. The GitHub Actions workflow uploads both artifacts even when the suite fails, as long as the job was not cancelled.

## CI/CD

`.github/workflows/playwright.yml` is a single job:

1. Check out the repository.
2. Install Node.js 22 and `npm ci`.
3. Install Chromium and its operating-system dependencies.
4. Run `npx playwright test`.
5. Upload the HTML report and JUnit XML.

The workflow runs on push to `main` or `master`, on pull requests, and on manual dispatch. It does not deploy the application. SauceDemo is an external site, so the pipeline is a test runner, not a release pipeline.
