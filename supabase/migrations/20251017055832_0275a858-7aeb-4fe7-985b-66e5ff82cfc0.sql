-- Add user_id columns to track ownership
ALTER TABLE public.analyses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.hypotheses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL for new records (existing data will need backfill if any)
ALTER TABLE public.analyses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.hypotheses ALTER COLUMN user_id SET NOT NULL;

-- Drop old public policies
DROP POLICY IF EXISTS "Все могут создавать анализы" ON public.analyses;
DROP POLICY IF EXISTS "Все могут читать анализы" ON public.analyses;
DROP POLICY IF EXISTS "Все могут создавать гипотезы" ON public.hypotheses;
DROP POLICY IF EXISTS "Все могут читать гипотезы" ON public.hypotheses;

-- Create user-scoped RLS policies for analyses
CREATE POLICY "Users can create own analyses"
  ON public.analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own analyses"
  ON public.analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for hypotheses
CREATE POLICY "Users can create own hypotheses"
  ON public.hypotheses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own hypotheses"
  ON public.hypotheses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);