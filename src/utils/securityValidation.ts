/**
 * Security validation utilities for sensitive data access
 * 
 * This module provides runtime validation to ensure sensitive PII data
 * is only accessed with proper authentication and authorization.
 */

import { User } from '@supabase/supabase-js';

/**
 * Validates that a user is authenticated before accessing sensitive data
 * Throws an error if user is not authenticated
 */
export const requireAuthentication = (user: User | null): User => {
  if (!user) {
    throw new Error('Authentication required: Cannot access sensitive user data without authentication');
  }
  return user;
};

/**
 * Validates that a user can only access their own data
 * Throws an error if attempting to access another user's data
 */
export const requireOwnData = (user: User, requestedUserId: string): void => {
  if (user.id !== requestedUserId) {
    throw new Error('Authorization error: Users can only access their own data');
  }
};

/**
 * Sanitizes error messages to prevent leaking sensitive information
 */
export const sanitizeError = (error: any): string => {
  // Remove any potential PII from error messages
  const message = error?.message || 'An error occurred';
  
  // List of sensitive keywords that shouldn't appear in error messages
  const sensitivePatterns = [
    /email[:\s]+[\w.-]+@[\w.-]+/gi,
    /password[:\s]+\S+/gi,
    /token[:\s]+\S+/gi,
    /api[_-]?key[:\s]+\S+/gi,
  ];
  
  let sanitized = message;
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  return sanitized;
};

/**
 * Audit log for sensitive data access
 * In production, this should log to a secure audit trail
 */
export const auditDataAccess = (
  userId: string,
  action: 'read' | 'write' | 'delete',
  table: string,
  success: boolean
): void => {
  // In development, just console log
  // In production, this should send to a secure logging service
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', {
      timestamp: new Date().toISOString(),
      userId,
      action,
      table,
      success,
    });
  }
  
  // TODO: In production, send to audit logging service
  // Example: sendToAuditService({ userId, action, table, success, timestamp: Date.now() });
};
