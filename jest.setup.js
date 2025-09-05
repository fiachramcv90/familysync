import '@testing-library/jest-dom'

// Polyfill for Node.js globals needed by Next.js
global.Request = global.Request || require('node-fetch').Request;
global.Response = global.Response || require('node-fetch').Response;
global.Headers = global.Headers || require('node-fetch').Headers;

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.JWT_SECRET = 'test-jwt-secret'