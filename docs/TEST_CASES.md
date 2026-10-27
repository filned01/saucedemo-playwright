# Test cases

Scripts live in `tests/`. Data lives in `test-data/`. This list is the map between the assignment areas and the automated cases.

## Authentication — `tests/auth.spec.ts`

| Case | Expected result |
| --- | --- |
| Standard user login | Products page loads and the cart link is visible |
| Performance user login | Products page loads within 60 seconds |
| Locked-out user | Error: account is locked; login form stays on screen |
| Unknown username and password | Credentials do not match |
| Valid username, wrong password | Credentials do not match |
| Empty username | Username is required |
| Empty password | Password is required |
| Both fields empty | Username is required (checked first) |
| Username with surrounding spaces | Treated as a different user and rejected |
| Error banner close button | Banner is removed |
| Direct open of `/inventory.html` | Blocked until login |
| Direct open of `/cart.html` | Blocked until login |
| Direct open of `/checkout-step-one.html` | Blocked until login |
| Direct open of `/checkout-step-two.html` | Blocked until login |
| Direct open of `/checkout-complete.html` | Blocked until login |

## Products page — `tests/products.spec.ts`

| Case | Expected result |
| --- | --- |
| Catalog contents | Six products, each with name, price from test data, and a description |
| Sort by name | A to Z, then Z to A, matching the catalog names |
| Sort by price | Prices are monotonic; cheapest is 7.99 and dearest is 49.99 |
| Product details | Title opens the matching item id; Back to products returns to the catalog |
| Add and remove on the catalog | Badge becomes 1, then disappears; the button label swaps |
| Problem user | Can sign in and still sees six products |

## Add to cart — `tests/cart.spec.ts`

| Case | Expected result |
| --- | --- |
| Add one product | Badge is 1 and the cart row shows that name and price |
| Add three products | Badge and cart both show three rows |
| Add the same product again | The control becomes Remove; the badge stays at 1 |
| Remove one of two cart rows | The remaining product stays; badge is 1 |
| Continue shopping | Returns to the catalog and the cart is unchanged |
| Add from the detail page | Cart contains the product opened from the catalog |
| Empty cart | No rows; Checkout is still available |

## Checkout — `tests/checkout.spec.ts`

| Case | Expected result |
| --- | --- |
| Single-product order | Information, overview totals, thank-you page, empty cart, Back Home |
| All six products | Overview lists every item; tax is 8% of the subtotal, rounded to the cent |
| Missing first name | Stays on step one; first name is required |
| Missing last name | Last name is required |
| Missing postal code | Postal code is required |
| Cancel on step one | Returns to the cart with the item still there |
| Cancel on overview | Returns to the catalog; the badge is unchanged |
| Empty-cart checkout | Completes with `Item total: $0`, `Tax: $0.00`, and `Total: $0.00` |

Checkout customers are the synthetic records in `test-data/customers.json`.

## Burger menu — `tests/burger-menu.spec.ts`

| Case | Expected result |
| --- | --- |
| Open and close | All Items, Dynamic Catalog, About, Logout, and Reset App State appear, then the menu hides |
| All Items from the cart | Catalog loads and the cart badge is unchanged |
| About | Navigates away from the shop to a `saucelabs.com` URL |
| Logout | Login form returns; signing in again keeps the item that was in the cart |
| Reset App State on the catalog | Badge clears immediately; after reload the product shows Add to cart |
| Reset App State during checkout | Badge clears on the information step and after returning to the catalog |

## Out of scope

These demo accounts exist on the site and are not given their own functional specs, because the site intentionally breaks them:

- `error_user` fails on parts of checkout
- `visual_user` is meant for visual comparison

`problem_user` is covered only as far as “can reach the catalog”. Broken images for that user are a property of the demo, not a defect in this suite.
