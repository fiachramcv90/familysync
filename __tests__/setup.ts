// Test setup configuration
// Story 1.3: Database Schema and Models

import { config } from 'dotenv';

// Load environment variables from .env.test file
config({ path: '.env.test' });

// Global test configuration
beforeAll(() => {
  // Set test timeout
  jest.setTimeout(30000);
  
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
});

afterAll(() => {
  // Cleanup any global resources
});

// Mock environment variables for tests
process.env.SUPABASE_TEST_URL = process.env.SUPABASE_TEST_URL || 'http://localhost:54321';
process.env.SUPABASE_TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_TEST_SERVICE_KEY = process.env.SUPABASE_TEST_SERVICE_KEY || 'test-service-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';