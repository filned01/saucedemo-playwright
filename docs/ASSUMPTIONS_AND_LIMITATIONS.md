# Assumptions and limitations

## Assumptions

- The application under test is the public Sauce Demo shop at `https://www.saucedemo.com/`. `BASE_URL` can point at another host only if that host serves the same UI.
- The published demo accounts and the shared demo password stay as the site documents them. They are stored in `test-data/users.json` so the suite runs without a secrets store. They are demo credentials for a public training site, not credentials for any other system.
- The catalog stays at six products with the names, ids, slugs, and prices in `test-data/products.json`. Checkout math reads those prices. A catalog change requires a test-data update, not a change to the assertion style.
- Sales tax is 8% of the item subtotal, rounded to the nearest cent. That matches the overview page on the date this suite was written.
- A successful order ends at “Thank you for your order!”. The demo does not take payment, create a real shipment, or send email.
- The signed-in session lives in the browser context. Playwright’s default isolation (one context per test) is what keeps carts from colliding.
- Chromium is the browser of record for local runs and for CI. The Playwright config can gain Firefox and WebKit projects later without rewriting specs.
- Checkout customers in `test-data/customers.json` are synthetic. Any non-empty first name, last name, and postal code are accepted by the demo.
- English UI copy is part of the contract for error messages and the order-complete heading. Those strings are asserted exactly.

## Limitations

- The suite is UI-only. It does not call a private API, and the demo does not expose a database to check after checkout.
- `problem_user`, `error_user`, and `visual_user` ship with intentional defects. Asserting those defects as failures would make the suite red for behavior the site is designed to show. Only `problem_user` reaching the catalog is automated.
- The About item navigates from SauceDemo to Sauce Labs. The test checks that the URL contains `saucelabs.com` without waiting for the external marketing page to finish loading. It does not assert page content, which changes independently of the shop.
- There is no visual-regression baseline. Screenshots and video are failure evidence, not pixel diffs.
- There is no quantity control. The demo toggles a product between Add and Remove and always uses a quantity of one.
- Logout returns to the login form, but the cart is stored in the browser and is still there after the same user signs in again. Reset App State is what clears it. The logout test asserts the cart is kept.
- Reset App State clears the cart badge immediately. The Add/Remove label on the product card you are already looking at updates after the inventory page loads again. The catalog reset test reloads before it checks that label.
- An empty cart can still be checked out. The overview then shows `Item total: $0`, `Tax: $0.00`, and `Total: $0.00`. Non-zero item totals use two decimal places.
- The burger menu includes a Dynamic Catalog entry. The open-menu test checks that the entry is visible. The suite does not follow it, because that destination is separate from the five flows in the assignment.
- On the product detail page the add control is a single “Add to cart” button. It does not use the catalog `data-test` slug. The detail-page cart test uses that button name.
- Tests need a live network path to SauceDemo. An outage, a captive portal, or a change in the site’s DOM will fail the run. Locators prefer `data-test` hooks so ordinary style changes do not cause that.
- CI runs Chromium only, with two workers and two retries. It does not deploy, publish, or test other browsers.
- The HTML report and JUnit file are produced on the machine that runs the tests. They are not checked in.
- Sorting by price asserts the first price, the last price, and that the list is ordered. The two $15.99 items may swap relative order without failing the price test. Name sorting asserts the full name order.

## Maintenance notes

- Add a product by editing `test-data/products.json` only if the site’s catalog actually changed. The “all products” checkout test will pick it up.
- Add a user by editing `test-data/users.json` and, if the behavior is new, a spec under `tests/`.
- Keep selectors inside `src/pages/`. Specs should keep calling page-object methods when the markup moves.
