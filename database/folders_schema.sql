-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Policies for folders
CREATE POLICY "Users can view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Add folder_id to whatsapp_instances
ALTER TABLE public.whatsapp_instances ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL;
