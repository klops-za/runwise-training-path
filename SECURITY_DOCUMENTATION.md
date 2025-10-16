# Security Documentation - MyBestRunning

## Core Security Implementation

### ✅ Implemented Security Measures

1. **Input Validation** - All user inputs validated using Zod schemas in `src/utils/validationSchemas.ts`
2. **Input Sanitization** - XSS prevention utilities in `src/utils/inputValidation.ts`
3. **Rate Limiting** - Lead capture limited to 3 submissions per email per 24 hours via `create-lead` edge function
4. **Payment Security** - Webhook signature verification and idempotent payment processing with `payment_reference` tracking
5. **RLS Policies** - All sensitive tables protected with Row-Level Security
6. **Premium Access** - Server-side verification in database functions (cannot be bypassed)

### Premium Feature Pattern (CRITICAL)

**Always verify subscription server-side:**

```sql
-- In Database Functions
IF NOT EXISTS (
  SELECT 1 FROM subscriptions 
  WHERE runner_id = user_id 
  AND is_active = true 
  AND tier = 'Premium'
) THEN
  RAISE EXCEPTION 'Active Premium subscription required';
END IF;
```

**Client-side checks are for UI/UX only** - never for authorization.

### Edge Functions Security

- `create-lead`: Public, rate-limited, input validated
- `paystack-webhook`: Public, signature verified
- `paystack-init` & `paystack-verify`: Authenticated users only

### Manual Configuration Required

Two items require Supabase dashboard configuration:
1. **Enable Leaked Password Protection** - Auth → Settings
2. **Upgrade Postgres Version** - Database → Settings

For detailed security procedures, see original SECURITY_DOCUMENTATION.md
