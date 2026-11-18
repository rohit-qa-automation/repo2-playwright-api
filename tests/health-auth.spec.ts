import { test, expect } from '../src/fixtures/api';
import { CREDENTIALS } from '../src/data/bookingFactory';
import { AuthFailureSchema, AuthSuccessSchema } from '../src/schemas/booking';

test.describe('Health check', () => {
  test('API is up @smoke', async ({ api }) => {
    const res = await api.ping();
    // Restful-Booker answers its health check with 201 Created.
    expect(res.status()).toBe(201);
  });
});

test.describe('Authentication', () => {
  test('valid credentials return a token @smoke', async ({ api }) => {
    const res = await api.createToken(CREDENTIALS.username, CREDENTIALS.password);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    AuthSuccessSchema.parse(await res.json());
  });

  const badCredentials = [
    { title: 'wrong password', username: CREDENTIALS.username, password: 'wrong' },
    { title: 'unknown user', username: 'nobody', password: CREDENTIALS.password },
    { title: 'empty credentials', username: '', password: '' },
  ];

  for (const c of badCredentials) {
    test(`${c.title} is rejected`, async ({ api }) => {
      const res = await api.createToken(c.username, c.password);
      // Documented API behaviour: failure is signalled in the body, not with 401.
      expect(res.status()).toBe(200);
      const body = AuthFailureSchema.parse(await res.json());
      expect(body).not.toHaveProperty('token');
    });
  }
});
