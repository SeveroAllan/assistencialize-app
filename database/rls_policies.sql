-- RLS Policies for whatsapp_instances table
-- Enable RLS
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own instances
CREATE POLICY "Users can view own instances"
ON public.whatsapp_instances
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own instances
CREATE POLICY "Users can insert own instances"
ON public.whatsapp_instances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own instances
CREATE POLICY "Users can update own instances"
ON public.whatsapp_instances
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own instances
CREATE POLICY "Users can delete own instances"
ON public.whatsapp_instances
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for plans table (read-only for all authenticated users)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all plans
CREATE POLICY "Authenticated users can view plans"
ON public.plans
FOR SELECT
TO authenticated
USING (true);
