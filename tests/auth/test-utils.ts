/**
 * Utility functions and shared mocks for authentication testing
 */

// Mock user data for testing
export const mockUsers = {
  valid: {
    id: "user-123",
    authId: "user-123",
    email: "user@example.com",
    username: "testuser",
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: "admin-456",
    authId: "admin-456",
    email: "admin@example.com",
    username: "adminuser",
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
};

// Mock request creators
export function createMockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Request {
  const init: RequestInit = {
    method,
    headers: headers ? new Headers(headers) : new Headers(),
  };
  
  if (body) {
    init.body = JSON.stringify(body);
    (init.headers as Headers).set("Content-Type", "application/json");
  }
  
  return new Request(new URL(url, "http://localhost:8000"), init);
}

// Mock responses for better-auth tests
export class MockResponse {
  status = 200;
  body: unknown = null;
  headers = new Headers();
  cookies: Record<string, { value: string; options?: Record<string, unknown> }> = {};

  set(status: number, body: unknown) {
    this.status = status;
    this.body = body;
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }

  setCookie(name: string, value: string, options?: Record<string, unknown>) {
    this.cookies[name] = { value, options };
    return this;
  }
}

// Cleanup helpers
export async function cleanupTestKv(kv: Deno.Kv, prefix: unknown[] = []) {
  for await (const entry of kv.list({ prefix })) {
    await kv.delete(entry.key);
  }
}

// Environment variable helpers
export class EnvManager {
  private savedVars: Record<string, string | null> = {};
  
  saveAll() {
    this.save("JWT_SECRET");
    this.save("FRONTEND_URL");
    this.save("RESEND_KEY");
  }
  
  save(key: string) {
    this.savedVars[key] = Deno.env.get(key) || null;
    return this;
  }
  
  set(key: string, value: string) {
    if (!(key in this.savedVars)) {
      this.save(key);
    }
    Deno.env.set(key, value);
    return this;
  }
  
  restore() {
    for (const [key, value] of Object.entries(this.savedVars)) {
      if (value === null) {
        Deno.env.delete(key);
      } else {
        Deno.env.set(key, value);
      }
    }
    this.savedVars = {};
    return this;
  }
}