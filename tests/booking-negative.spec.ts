import { test, expect } from '../src/fixtures/api';
import { buildBooking } from '../src/data/bookingFactory';

test.describe('Authorisation and error handling', () => {
  test('update without a token is forbidden', async ({ api, booking }) => {
    const res = await api.update(booking.bookingid, buildBooking());
    expect(res.status()).toBe(403);
  });

  test('partial update with an invalid token is forbidden', async ({ api, booking }) => {
    const res = await api.withToken('not-a-real-token').partialUpdate(booking.bookingid, { totalprice: 1 });
    expect(res.status()).toBe(403);
  });

  test('delete without a token is forbidden and the booking survives', async ({ api, booking }) => {
    const res = await api.delete(booking.bookingid);
    expect(res.status()).toBe(403);
    expect((await api.get(booking.bookingid)).status()).toBe(200);
  });

  test('fetching a booking that does not exist returns 404', async ({ api }) => {
    const res = await api.get(999_999_999);
    expect(res.status()).toBe(404);
  });
});

/**
 * Defects found in the API. Each test asserts the CORRECT behaviour and is
 * marked test.fail(), so the suite stays green while the bug exists and
 * alerts us when it is fixed. In a client project these become bug tickets.
 */
test.describe('Known defects', () => {
  test('creating a booking with missing fields returns 400 Bad Request', async ({ api }) => {
    test.fail(true, 'BUG: API returns 500 Internal Server Error for invalid input');
    const res = await api.create({ firstname: 'OnlyAFirstName' });
    expect(res.status()).toBe(400);
  });

  test('deleting a booking returns 204 No Content', async ({ authedApi, booking }) => {
    test.fail(true, 'BUG: API returns 201 Created for a successful DELETE');
    const res = await authedApi.delete(booking.bookingid);
    expect(res.status()).toBe(204);
  });

  test('a checkout date before check-in is rejected', async ({ api, authedApi }) => {
    test.fail(true, 'BUG: API accepts bookings whose checkout is before checkin');
    const res = await api.create(
      buildBooking({ bookingdates: { checkin: '2030-01-10', checkout: '2030-01-05' } }),
    );
    if (res.ok()) {
      const { bookingid } = await res.json();
      await authedApi.delete(bookingid);
    }
    expect(res.status()).toBe(400);
  });
});
