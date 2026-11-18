import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { buildBooking, CREDENTIALS } from '../data/bookingFactory';
import { AuthSuccessSchema, CreateBookingResponseSchema, type CreateBookingResponse } from '../schemas/booking';

type TestFixtures = {
  /** Unauthenticated client. */
  api: BookingClient;
  /** Client that sends the auth token on PUT / PATCH / DELETE. */
  authedApi: BookingClient;
  /** A fresh booking created for this test and deleted afterwards. */
  booking: CreateBookingResponse;
};

type WorkerFixtures = {
  /** One auth token per worker, instead of one per test. */
  authToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authToken: [
    async ({}, use, workerInfo) => {
      const ctx = await playwrightRequest.newContext({
        baseURL: workerInfo.project.use.baseURL,
        extraHTTPHeaders: { Accept: 'application/json' },
      });
      const res = await ctx.post('/auth', { data: CREDENTIALS });
      expect(res.status()).toBe(200);
      const { token } = AuthSuccessSchema.parse(await res.json());
      await use(token);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ request }, use) => use(new BookingClient(request)),

  authedApi: async ({ api, authToken }, use) => use(api.withToken(authToken)),

  booking: async ({ api, authedApi }, use) => {
    const res = await api.create(buildBooking());
    expect(res.status()).toBe(200);
    const created = CreateBookingResponseSchema.parse(await res.json());
    await use(created);
    // Teardown: keep the shared public API tidy. Ignore "already deleted".
    await authedApi.delete(created.bookingid);
  },
});

export { expect };
