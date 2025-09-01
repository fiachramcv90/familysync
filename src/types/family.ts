// Family-related types for FamilySync application
// Story 1.3: Database Schema and Models

import { FamilyRecord, FamilyMemberRecord, FamilySettings } from './database';

// Domain model interfaces (business logic representation)
export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  settings: FamilySettings;
  createdAt: Date;
  updatedAt: Date;
  members?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  familyId: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  avatarColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
}

// Family creation and update interfaces
export interface CreateFamilyInput {
  name: string;
  creatorEmail: string;
  creatorName: string;
  creatorPassword: string;
  settings?: Partial<FamilySettings>;
}

export interface UpdateFamilyInput {
  name?: string;
  settings?: Partial<FamilySettings>;
}

// Family member invitation and management
export interface InviteFamilyMemberInput {
  email: string;
  name: string;
  role?: 'admin' | 'member';
  avatarColor?: string;
}

export interface UpdateFamilyMemberInput {
  name?: string;
  role?: 'admin' | 'member';
  avatarColor?: string;
  isActive?: boolean;
}

export interface JoinFamilyInput {
  inviteCode: string;
  email: string;
  name: string;
  password: string;
  avatarColor?: string;
}

// Family statistics and dashboard data
export interface FamilyStats {
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingEvents: number;
  overdueTasks: number;
}

export interface FamilyMemberStats {
  memberId: string;
  memberName: string;
  avatarColor: string;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingEvents: number;
  completionRate: number;
}

// Family preferences and settings
export interface NotificationSettings {
  enabled: boolean;
  taskReminders?: boolean;
  eventReminders?: boolean;
  weeklyDigest?: boolean;
  reminderTime?: string; // HH:mm format
}

export interface WeeklyViewSettings {
  startDay: 'sunday' | 'monday';
  showCompleted: boolean;
  groupByMember: boolean;
  defaultView: 'list' | 'calendar' | 'board';
}

export interface FamilyPreferences {
  timezone: string;
  notifications: NotificationSettings;
  weeklyView: WeeklyViewSettings;
  taskCategories?: string[];
  eventTypes?: string[];
}

// Error types for family operations
export interface FamilyError {
  code: 'FAMILY_NOT_FOUND' | 'INVALID_INVITE_CODE' | 'MEMBER_ALREADY_EXISTS' | 'INSUFFICIENT_PERMISSIONS' | 'FAMILY_LIMIT_EXCEEDED';
  message: string;
  field?: string;
}

// Family invitation system
export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  inviteCode: string;
  invitedBy: string;
  invitedByName: string;
  expiresAt: Date;
  isValid: boolean;
}

// Family role permissions
export interface FamilyPermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateFamilySettings: boolean;
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canDeleteTasks: boolean;
  canCreateEvents: boolean;
  canUpdateEvents: boolean;
  canDeleteEvents: boolean;
  canViewAllTasks: boolean;
  canViewAllEvents: boolean;
}

// Utility functions for type conversion
export type FamilyFromDatabase = (record: FamilyRecord) => Family;
export type FamilyToDatabase = (family: Family) => Partial<FamilyRecord>;
export type FamilyMemberFromDatabase = (record: FamilyMemberRecord) => FamilyMember;
export type FamilyMemberToDatabase = (member: FamilyMember) => Partial<FamilyMemberRecord>;

// Family query options
export interface FamilyQueryOptions {
  includeMembers?: boolean;
  includeStats?: boolean;
  includeInactiveMembers?: boolean;
}