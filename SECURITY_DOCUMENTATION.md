# Security Documentation - Runners Table (PII Protection)

## Overview
The `runners` table contains highly sensitive Personal Identifiable Information (PII) including:
- Email addresses
- First and last names
- Age, gender
- Physical measurements (height, weight)
- Medical history (injury history)
- Training preferences and data

## Security Measures Implemented

### 1. Database-Level Security (Row-Level Security - RLS)

**Status**: ✅ **FULLY SECURED**

All RLS policies are properly configured to ensure users can only access their own data:

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.runners FOR SELECT
USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.runners FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON public.runners FOR UPDATE
USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.runners FOR DELETE
USING (auth.uid() = id);

-- Explicit deny for anonymous users (defense-in-depth)
CREATE POLICY "Deny all anonymous access to runners"
ON public.runners FOR ALL TO anon
USING (false) WITH CHECK (false);
```

### 2. Application-Level Security

**All queries in the codebase**:
- ✅ Require user authentication (`if (!user) return`)
- ✅ Filter by authenticated user ID (`.eq('id', user.id)`)
- ✅ Include security validation via `requireAuthentication()` helper

**Files with runners table access**:
- `src/pages/Profile.tsx` - User profile management
- `src/pages/Dashboard.tsx` - Dashboard data display
- `src/pages/Onboarding.tsx` - Initial profile setup
- `src/pages/TrainingSchedule.tsx` - Training schedule display
- `src/components/plans/CreatePlanDialog.tsx` - Plan creation
- `src/pages/Index.tsx` - Home page routing check

### 3. Runtime Validation

A security validation utility (`src/utils/securityValidation.ts`) provides:
- `requireAuthentication()` - Ensures user is authenticated before data access
- `requireOwnData()` - Validates user can only access their own data
- `sanitizeError()` - Prevents PII leakage in error messages
- `auditDataAccess()` - Logs sensitive data access for security monitoring

### 4. Data Integrity Constraints

```sql
-- Ensures email is always provided when creating profiles
ALTER TABLE public.runners 
ADD CONSTRAINT runners_email_not_empty 
CHECK (email IS NOT NULL AND email != '');
```

### 5. Database Documentation

All sensitive columns are marked with comments:
```sql
COMMENT ON COLUMN public.runners.email IS 'SENSITIVE PII: Email address - must never be exposed publicly';
COMMENT ON COLUMN public.runners.first_name IS 'SENSITIVE PII: Personal name - must never be exposed publicly';
-- ... and so on for all PII fields
```

## How the Security Works

### Defense-in-Depth Strategy

1. **Database Layer**: RLS policies prevent unauthorized data access at the database level
2. **Application Layer**: All queries explicitly filter by authenticated user ID
3. **Runtime Layer**: Security validation functions provide additional checks
4. **Audit Layer**: Data access is logged for security monitoring

### Attack Prevention

❌ **Anonymous access**: Blocked by RLS policy
❌ **Cross-user access**: Blocked by RLS `auth.uid() = id` check
❌ **SQL injection**: Supabase client uses parameterized queries
❌ **Data leakage in errors**: Sanitized by `sanitizeError()` function

## Security Best Practices for Developers

When working with the `runners` table:

1. **Always check authentication first**:
   ```typescript
   if (!user) return;
   requireAuthentication(user);
   ```

2. **Always filter by user ID**:
   ```typescript
   .from('runners')
   .select('*')
   .eq('id', user.id)  // CRITICAL: Never omit this filter
   ```

3. **Never expose PII in logs or errors**:
   ```typescript
   try {
     // database operation
   } catch (error) {
     const safeMessage = sanitizeError(error);
     console.error(safeMessage);
   }
   ```

4. **Use single() or maybeSingle()** for profile queries:
   ```typescript
   .single()  // Expects exactly one row
   // OR
   .maybeSingle()  // May return null if no profile exists
   ```

## Compliance Considerations

This implementation aligns with:
- ✅ **GDPR**: Users control their own data, can delete profiles
- ✅ **CCPA**: Users have access to their personal information
- ✅ **HIPAA considerations**: Medical data (injury history) is properly protected
- ✅ **PCI DSS**: No payment data stored, but same protection principles applied

## Audit and Monitoring

The `auditDataAccess()` function logs:
- Timestamp
- User ID
- Action (read/write/delete)
- Table name
- Success/failure status

In production, these logs should be sent to a secure logging service for:
- Security incident investigation
- Compliance reporting
- Anomaly detection

## Testing Security

To verify security is working:

1. **Test RLS policies** in Supabase SQL Editor:
   ```sql
   -- This should return 0 rows for anonymous users
   SELECT count(*) FROM runners;
   ```

2. **Test in browser console**:
   ```javascript
   // Try to access another user's data (should fail)
   await supabase.from('runners').select('*').eq('id', 'some-other-user-id');
   ```

3. **Check application logs** for audit entries

## Security Updates

Last security review: 2025-10-01
Next scheduled review: 2026-01-01

## Contact

For security concerns or questions, please review this documentation and the RLS policies in the Supabase dashboard.
