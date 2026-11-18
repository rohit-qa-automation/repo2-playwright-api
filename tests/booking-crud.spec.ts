import { test, expect } from '../src/fixtures/api';
import { buildBooking } from '../src/data/bookingFactory';
import { BookingSchema, CreateBookingResponseSchema } from '../src/schemas/booking';

test.describe('Booking CRUD', () => {
  test('create a booking and read it back @smoke', async ({ api, authedApi }) => {
    const payload = buildBooking();

    const createRes = await api.create(payload);
    expect(createRes.status()).toBe(200);
    const created = CreateBookingResponseSchema.parse(await createRes.json());
    expect(created.booking).toEqual(payload);

    const getRes = await api.get(created.bookingid);
    expect(getRes.status()).toBe(200);
    expect(BookingSchema.parse(await getRes.json())).toEqual(payload);

    await authedApi.delete(created.bookingid);
  });

  const variants = [
    { title: 'without a deposit', overrides: { depositpaid: false } },
    { title: 'with a zero price', overrides: { totalprice: 0 } },
    { title: 'without additional needs', overrides: { additionalneeds: undefined } },
    { title: 'with unicode names', overrides: { firstname: 'Zoë', lastname: 'Ångström' } },
  ];

  for (const v of variants) {
    test(`create a booking ${v.title}`, async ({ api, authedApi }) => {
      const payload = buildBooking(v.overrides);
      const res = await api.create(payload);
      expect(res.status()).toBe(200);
      const created = CreateBookingResponseSchema.parse(await res.json());
      expect(created.booking).toEqual(JSON.parse(JSON.stringify(payload)));
      await authedApi.delete(created.bookingid);
    });
  }

  test('full update (PUT) replaces every field', async ({ authedApi, api, booking }) => {
    const replacement = buildBooking({ lastname: 'Updated', totalprice: 999, depositpaid: false });

    const res = await authedApi.update(booking.bookingid, replacement);
    expect(res.status()).toBe(200);
    expect(BookingSchema.parse(await res.json())).toEqual(replacement);

    const after = await api.get(booking.bookingid);
    expect(await after.json()).toEqual(replacement);
  });

  test('partial update (PATCH) changes only the given fields', async ({ authedApi, booking }) => {
    const res = await authedApi.partialUpdate(booking.bookingid, {
      totalprice: 123,
      additionalneeds: 'Late checkout',
    });
    expect(res.status()).toBe(200);
    const updated = BookingSchema.parse(await res.json());
    expect(updated).toEqual({
      ...booking.booking,
      totalprice: 123,
      additionalneeds: 'Late checkout',
    });
  });

  test('deleted booking can no longer be fetched', async ({ authedApi, api, booking }) => {
    const del = await authedApi.delete(booking.bookingid);
    expect(del.ok()).toBeTruthy();

    const res = await api.get(booking.bookingid);
    expect(res.status()).toBe(404);
  });
});
