-- Add length constraints to analyses table for input validation
ALTER TABLE public.analyses ADD CONSTRAINT task_length_check 
  CHECK (char_length(task) >= 10 AND char_length(task) <= 2000);

ALTER TABLE public.analyses ADD CONSTRAINT goal_length_check 
  CHECK (char_length(goal) >= 5 AND char_length(goal) <= 500);

ALTER TABLE public.analyses ADD CONSTRAINT constraints_length_check 
  CHECK (constraints IS NULL OR char_length(constraints) <= 1000);