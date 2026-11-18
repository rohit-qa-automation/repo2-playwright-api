import { randomUUID } from 'node:crypto';
import type { Booking } from '../schemas/booking';

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Builds a valid booking with unique names, so parallel tests never collide
 * on shared data in the public API. Pass overrides for the fields a test cares about.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const id = randomUUID().slice(0, 8);
  const checkin = addDays(new Date(), 30);
  return {
    firstname: `Qa${id}`,
    lastname: 'Automation',
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: isoDate(checkin),
      checkout: isoDate(addDays(checkin, 3)),
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

export const CREDENTIALS = {
  username: process.env.API_USERNAME ?? 'admin',
  password: process.env.API_PASSWORD ?? 'password123',
};
