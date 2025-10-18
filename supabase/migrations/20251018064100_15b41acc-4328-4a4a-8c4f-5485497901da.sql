-- Make user_id nullable in analyses table
ALTER TABLE public.analyses ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in hypotheses table  
ALTER TABLE public.hypotheses ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow public access for analyses
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can create their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.analyses;

CREATE POLICY "Anyone can view analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Anyone can create analyses" ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update analyses" ON public.analyses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete analyses" ON public.analyses FOR DELETE USING (true);

-- Update RLS policies to allow public access for hypotheses
DROP POLICY IF EXISTS "Users can view their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can create their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can update their own hypotheses" ON public.hypotheses;
DROP POLICY IF EXISTS "Users can delete their own hypotheses" ON public.hypotheses;

CREATE POLICY "Anyone can view hypotheses" ON public.hypotheses FOR SELECT USING (true);
CREATE POLICY "Anyone can create hypotheses" ON public.hypotheses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update hypotheses" ON public.hypotheses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete hypotheses" ON public.hypotheses FOR DELETE USING (true);