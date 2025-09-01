# API Specification

## Next.js API Routes Specification

```yaml
openapi: 3.0.0
info:
  title: FamilySync API
  version: 1.0.0
  description: Family coordination and task management API via Next.js API Routes
servers:
  - url: https://familysync.vercel.app/api
    description: Production server (Vercel)
  - url: http://localhost:3000/api
    description: Development server

paths:
  /auth/register:
    post:
      summary: Register new user account (via Supabase Auth)
      description: Uses Supabase Auth for user registration with automatic JWT token management
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 12
                name:
                  type: string
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/SupabaseUser'
                  session:
                    $ref: '#/components/schemas/SupabaseSession'

  /auth/session:
    get:
      summary: Get current user session
      description: Returns current authenticated user via Supabase Auth
      security:
        - supabaseAuth: []
      responses:
        '200':
          description: Session retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/SupabaseUser'
                  session:
                    $ref: '#/components/schemas/SupabaseSession'

  /families:
    post:
      summary: Create new family
      description: Creates family with RLS policies automatically applied
      security:
        - supabaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        '201':
          description: Family created with automatic RLS setup
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Family'

  /families/[familyId]/invite:
    post:
      summary: Generate family invitation
      description: Next.js dynamic route with family ID parameter
      security:
        - supabaseAuth: []
      responses:
        '200':
          description: Invitation code generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  inviteCode:
                    type: string
                  expiresAt:
                    type: string
                    format: date-time

  /families/join/[inviteCode]:
    post:
      summary: Join family using invitation code
      description: Next.js dynamic route with invite code parameter
      security:
        - supabaseAuth: []
      responses:
        '200':
          description: Successfully joined family with RLS access
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Family'

  /tasks:
    get:
      summary: Get family tasks with RLS filtering
      description: Automatically filtered by family via RLS policies
      security:
        - supabaseAuth: []
      parameters:
        - name: week
          in: query
          schema:
            type: string
            format: date
          description: Week start date (YYYY-MM-DD)
        - name: assigneeId
          in: query
          schema:
            type: string
          description: Filter by assigned family member
      responses:
        '200':
          description: Tasks retrieved with automatic family filtering
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'

    post:
      summary: Create new task with real-time broadcast
      description: Creates task and broadcasts to family members via Supabase real-time
      security:
        - supabaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                assigneeId:
                  type: string
                dueDate:
                  type: string
                  format: date-time
                category:
                  type: string
                  enum: [task, event]
                priority:
                  type: string
                  enum: [low, medium, high]
      responses:
        '201':
          description: Task created with real-time notification
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

  /tasks/[taskId]:
    patch:
      summary: Update task with conflict resolution
      description: Next.js dynamic route with optimistic locking
      security:
        - supabaseAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                assigneeId:
                  type: string
                dueDate:
                  type: string
                  format: date-time
                status:
                  type: string
                  enum: [pending, in_progress, completed]
                version:
                  type: number
                  description: Optimistic locking version
      responses:
        '200':
          description: Task updated with real-time broadcast
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '409':
          description: Conflict detected via version mismatch
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  latestVersion:
                    $ref: '#/components/schemas/Task'

  /sync:
    post:
      summary: Bulk sync offline changes
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                lastSyncAt:
                  type: string
                  format: date-time
                changes:
                  type: array
                  items:
                    type: object
                    properties:
                      operation:
                        type: string
                        enum: [create, update, delete]
                      entityType:
                        type: string
                        enum: [task, event]
                      entityId:
                        type: string
                      data:
                        type: object
                      clientTimestamp:
                        type: string
                        format: date-time
      responses:
        '200':
          description: Sync completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  conflicts:
                    type: array
                    items:
                      type: object
                  serverChanges:
                    type: array
                    items:
                      type: object
                  syncTimestamp:
                    type: string
                    format: date-time

components:
  securitySchemes:
    supabaseAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Supabase Auth JWT token in Authorization header
  
  schemas:
    SupabaseUser:
      type: object
      properties:
        id:
          type: string
          description: Supabase user UUID
        email:
          type: string
        user_metadata:
          type: object
          properties:
            name:
              type: string
            avatar_color:
              type: string
        created_at:
          type: string
          format: date-time
    
    SupabaseSession:
      type: object
      properties:
        access_token:
          type: string
        refresh_token:
          type: string
        expires_in:
          type: number
        expires_at:
          type: number
        token_type:
          type: string

    Family:
      type: object
      properties:
        id:
          type: string
          description: UUID generated by Supabase
        name:
          type: string
        created_at:
          type: string
          format: date-time
        invite_code:
          type: string
        settings:
          type: object
          description: JSONB column in PostgreSQL

    Task:
      type: object
      properties:
        id:
          type: string
          description: UUID generated by Supabase
        family_id:
          type: string
          description: Foreign key with RLS filtering
        title:
          type: string
        description:
          type: string
        assignee_id:
          type: string
        created_by_id:
          type: string
        due_date:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
        status:
          type: string
          enum: [pending, in_progress, completed]
        category:
          type: string
          enum: [task, event]
        priority:
          type: string
          enum: [low, medium, high]
        version:
          type: number
          description: Optimistic locking version
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
```
