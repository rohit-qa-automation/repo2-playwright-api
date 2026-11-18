import { z } from 'zod';

/** Response contracts for the Restful-Booker API, validated in every test. */

export const BookingDatesSchema = z.object({
  checkin: z.iso.date(),
  checkout: z.iso.date(),
});

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const AuthSuccessSchema = z.object({ token: z.string().min(1) });
export const AuthFailureSchema = z.object({ reason: z.literal('Bad credentials') });

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;
