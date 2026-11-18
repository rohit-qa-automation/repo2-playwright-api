import { test, expect } from '../src/fixtures/api';
import { BookingIdListSchema } from '../src/schemas/booking';

test.describe('Booking search', () => {
  test('list all bookings returns valid ids', async ({ api }) => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const ids = BookingIdListSchema.parse(await res.json());
    expect(ids.length).toBeGreaterThan(0);
  });

  test('filter by first and last name finds the new booking @smoke', async ({ api, booking }) => {
    const res = await api.list({
      firstname: booking.booking.firstname,
      lastname: booking.booking.lastname,
    });
    expect(res.status()).toBe(200);
    const ids = BookingIdListSchema.parse(await res.json()).map((b) => b.bookingid);
    expect(ids).toContain(booking.bookingid);
  });

  test('filter by an unknown name returns an empty list', async ({ api }) => {
    const res = await api.list({ firstname: `NoSuchGuest${Date.now()}` });
    expect(res.status()).toBe(200);
    expect(BookingIdListSchema.parse(await res.json())).toEqual([]);
  });
});
