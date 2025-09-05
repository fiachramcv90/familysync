// Task API Endpoint Tests
// Story 2.1: Task Creation and Basic Management

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tasks/route';

// Mock Supabase client
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

// Mock validation schemas
jest.mock('@/lib/validations', () => ({
  createTaskInputSchema: {
    safeParse: jest.fn(),
  },
}));

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  single: jest.fn(),
  insert: jest.fn(() => mockSupabaseClient),
};

describe.skip('/api/tasks POST endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockCreateClient = require('@/lib/supabase-server').createClient as jest.MockedFunction<any>;
    mockCreateClient.mockResolvedValue(mockSupabaseClient);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Task',
        assigneeId: '1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 when validation fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: false,
      error: {
        errors: [{ path: ['title'], message: 'Title is required' }],
      },
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('returns 403 when family membership not found', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: true,
      data: {
        title: 'Test Task',
        assigneeId: '1',
        category: 'task',
        priority: 'medium',
      },
    });

    // Mock family member lookup returning no results
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: new Error('No family membership'),
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Task',
        assigneeId: '1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Family membership not found');
  });

  it('returns 400 when assignee is not in same family', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: true,
      data: {
        title: 'Test Task',
        assigneeId: 'invalid-assignee',
        category: 'task',
        priority: 'medium',
      },
    });

    // Mock successful family member lookup for creator
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { family_id: 'family-1' },
      error: null,
    });

    // Mock failed assignee lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid assignee'),
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Task',
        assigneeId: 'invalid-assignee',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid assignee - must be a family member');
  });

  it('creates task successfully with valid data', async () => {
    const mockUser = { id: 'user-1' };
    const mockTaskData = {
      title: 'Test Task',
      description: 'Test description',
      assigneeId: 'assignee-1',
      dueDate: '2024-12-25T00:00:00.000Z',
      category: 'task',
      priority: 'medium',
    };

    const mockCreatedTask = {
      id: 'task-1',
      family_id: 'family-1',
      title: 'Test Task',
      description: 'Test description',
      assignee_id: 'assignee-1',
      created_by_id: 'user-1',
      due_date: '2024-12-25T00:00:00.000Z',
      completed_at: null,
      status: 'pending',
      category: 'task',
      priority: 'medium',
      sync_version: 1,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      assignee: { id: 'assignee-1', name: 'Assignee', avatar_color: '#000000', role: 'member' },
      created_by: { id: 'user-1', name: 'Creator', avatar_color: '#000000', role: 'admin' },
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: true,
      data: mockTaskData,
    });

    // Mock family member lookup for creator
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { family_id: 'family-1' },
      error: null,
    });

    // Mock assignee lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'assignee-1', family_id: 'family-1' },
      error: null,
    });

    // Mock task creation
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: mockCreatedTask,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify(mockTaskData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockCreatedTask);
    expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
      family_id: 'family-1',
      title: 'Test Task',
      description: 'Test description',
      assignee_id: 'assignee-1',
      created_by_id: 'user-1',
      due_date: '2024-12-25T00:00:00.000Z',
      completed_at: null,
      status: 'pending',
      category: 'task',
      priority: 'medium',
      sync_version: 1,
    });
  });

  it('handles task creation without optional fields', async () => {
    const mockUser = { id: 'user-1' };
    const mockTaskData = {
      title: 'Simple Task',
      assigneeId: 'assignee-1',
      category: 'task',
      priority: 'medium',
    };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: true,
      data: mockTaskData,
    });

    // Mock family member lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { family_id: 'family-1' },
      error: null,
    });

    // Mock assignee lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'assignee-1', family_id: 'family-1' },
      error: null,
    });

    // Mock successful task creation
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: 'task-1', title: 'Simple Task' },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify(mockTaskData),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
      family_id: 'family-1',
      title: 'Simple Task',
      description: null,
      assignee_id: 'assignee-1',
      created_by_id: 'user-1',
      due_date: null,
      completed_at: null,
      status: 'pending',
      category: 'task',
      priority: 'medium',
      sync_version: 1,
    });
  });

  it('returns 500 on database errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const mockCreateTaskInputSchema = require('@/lib/validations').createTaskInputSchema;
    mockCreateTaskInputSchema.safeParse.mockReturnValue({
      success: true,
      data: {
        title: 'Test Task',
        assigneeId: 'assignee-1',
      },
    });

    // Mock family member lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { family_id: 'family-1' },
      error: null,
    });

    // Mock assignee lookup
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'assignee-1', family_id: 'family-1' },
      error: null,
    });

    // Mock database error on task creation
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Task',
        assigneeId: 'assignee-1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create task');
  });
});