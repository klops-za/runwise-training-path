-- Add payment tracking columns to subscriptions table
-- Enables idempotent payment processing and audit trail

-- Add payment_reference column (unique to prevent duplicate processing)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_reference TEXT UNIQUE;

-- Add payment_status column to track payment state
DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_status payment_status_type DEFAULT 'completed';

-- Add payment_metadata column for storing payment details
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_metadata JSONB;

-- Create index for faster payment reference lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_reference 
ON public.subscriptions(payment_reference) 
WHERE payment_reference IS NOT NULL;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status 
ON public.subscriptions(payment_status);

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.payment_reference IS 'Unique payment reference from Paystack for idempotency';
COMMENT ON COLUMN public.subscriptions.payment_status IS 'Current status of the payment';
COMMENT ON COLUMN public.subscriptions.payment_metadata IS 'Additional payment details from Paystack (amount, plan interval, etc.)';
