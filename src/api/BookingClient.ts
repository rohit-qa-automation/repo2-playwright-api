import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../schemas/booking';

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Thin client over the Restful-Booker endpoints. It returns raw responses so
 * tests can assert on status codes and headers as well as bodies.
 */
export class BookingClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  /** Same client, but sending the auth token cookie on write calls. */
  withToken(token: string): BookingClient {
    return new BookingClient(this.request, token);
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Cookie: `token=${this.token}` } : {};
  }

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  list(filter: BookingFilter = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: { ...filter } });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  create(booking: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  update(id: number, booking: Booking): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeaders() });
  }

  partialUpdate(id: number, fields: Partial<Booking>): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: fields, headers: this.authHeaders() });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders() });
  }
}
