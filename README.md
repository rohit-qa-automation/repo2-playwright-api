# API Test Suite: Restful-Booker

[![API tests](https://github.com/rohit-qa-automation/repo2-playwright-api/actions/workflows/api-tests.yml/badge.svg)](https://github.com/rohit-qa-automation/repo2-playwright-api/actions/workflows/api-tests.yml)

A **Playwright + TypeScript API test suite** for [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), a public hotel-booking REST API built for testing practice. It shows how I test backend APIs for SaaS teams:
- **contract (schema) validation** on every response;
- **self-cleaning test data**;
- **auth handling**;
- **documented defects**;
- **a CI run on every pull request**.

**Live reports:** [Playwright HTML report](https://rohit-qa-automation.github.io/repo2-playwright-api/playwright/) · [Allure report](https://rohit-qa-automation.github.io/repo2-playwright-api/allure/)

## What's covered (23 tests, about 9 s)

| Area | Tests |
|---|---|
| Health & auth | Health check, token creation, 3 invalid-credential cases (data-driven) |
| CRUD | Create + read-back, 4 create variants (no deposit, zero price, optional field missing, Unicode names), full update (PUT), partial update (PATCH), delete → 404 |
| Search | List all, filter by name finds the new booking, unknown name returns an empty list |
| Security / errors | PUT without a token → 403, PATCH with a bad token → 403, DELETE without a token → 403 (and the booking survives), unknown id → 404 |
| **Known defects** | 3 real API bugs found and documented (see below) |

### Bugs found in the API

| # | Expected | Actual |
|---|---|---|
| 1 | Invalid create payload → **400 Bad Request** | **500 Internal Server Error** |
| 2 | Successful DELETE → **204 No Content** (or 200) | **201 Created** |
| 3 | Checkout before check-in → rejected | **Accepted** (an invalid booking is stored) |

Each bug is a test that asserts the *correct* behaviour and is marked `test.fail()`. The suite stays green while the bug exists, and the test flags when a fix lands. In a client project, each one becomes a bug ticket.

## Design

```
src/
  api/BookingClient.ts   Typed client over the endpoints (returns raw responses for status checks)
  schemas/booking.ts     zod schemas = the API contract, validated in every test
  data/bookingFactory.ts Unique test data per test (safe for parallel runs)
  fixtures/api.ts        Fixtures: worker-scoped auth token, api / authedApi clients,
                         `booking` = created before the test, deleted after it
tests/                   Specs by feature; tag @smoke for the quick subset
.github/workflows/       CI: typecheck, tests, Allure, GitHub Pages
```

Key choices:
- **Playwright's `request` API, so no browsers are needed.** The same tool covers UI and API, which means one stack for the team.
- **Schema validation with zod.** It catches contract changes (renamed or missing fields, wrong types), not just wrong values.
- **Fixtures own setup and teardown.** Tests never depend on each other or on pre-existing data, and they clean up after themselves.
- **One auth token per worker** instead of one per test. It's faster and puts less load on the API.
- **Retries only for infrastructure flakiness** (a free host's cold start). The suite passed 46/46 with `--repeat-each=2 --retries=0`.

## Run it

```bash
npm ci
npm test              # all tests
npm run test:smoke    # @smoke only
npm run report        # open the HTML report
```

Optional: copy `.env.example` to `.env` to point at another environment.

## CI

Runs on every push and pull request to `main`, and daily on a schedule to catch API changes or outages:
1. type-check;
2. run the tests;
3. build the Allure and HTML reports;
4. publish both to GitHub Pages (from `main` only).

## See also

- [repo1-playwright-e2e](https://github.com/rohit-qa-automation/repo1-playwright-e2e): UI end-to-end framework with page objects, accessibility checks and cross-browser CI.

## Need this for your API?

I set up API and E2E test suites for SaaS teams, running in CI and handed over with docs, typically in 7–10 days. <!-- add your Upwork / Contra link here -->
