-- Таблица для анализов ГРА
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  domains TEXT[] NOT NULL,
  goal TEXT NOT NULL,
  constraints TEXT,
  recommendation TEXT NOT NULL,
  stress_test_gamma_inv DECIMAL,
  stress_test_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица для гипотез
CREATE TABLE public.hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  p_total DECIMAL NOT NULL,
  gamma DECIMAL NOT NULL,
  resonance_point DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('optimal', 'suboptimal', 'rejected')),
  rank INTEGER NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_hypotheses_analysis_id ON public.hypotheses(analysis_id);
CREATE INDEX idx_hypotheses_gamma ON public.hypotheses(gamma DESC);
CREATE INDEX idx_hypotheses_tags ON public.hypotheses USING GIN(tags);
CREATE INDEX idx_analyses_domains ON public.analyses USING GIN(domains);

-- Включаем Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;

-- Политики доступа (публичное чтение, так как это демо)
CREATE POLICY "Все могут читать анализы"
  ON public.analyses FOR SELECT
  USING (true);

CREATE POLICY "Все могут создавать анализы"
  ON public.analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Все могут читать гипотезы"
  ON public.hypotheses FOR SELECT
  USING (true);

CREATE POLICY "Все могут создавать гипотезы"
  ON public.hypotheses FOR INSERT
  WITH CHECK (true);

-- Функция для автоматической генерации тегов на основе доменов и статуса
CREATE OR REPLACE FUNCTION public.generate_hypothesis_tags(
  domains TEXT[],
  status TEXT,
  gamma DECIMAL
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  result_tags TEXT[] := '{}';
  domain TEXT;
BEGIN
  -- Добавляем домены как теги
  FOREACH domain IN ARRAY domains
  LOOP
    result_tags := array_append(result_tags, '#' || lower(replace(domain, ' ', '_')));
  END LOOP;
  
  -- Добавляем теги по статусу
  result_tags := array_append(result_tags, '#' || status);
  
  -- Добавляем тег по уровню Γ
  IF gamma > 2.0 THEN
    result_tags := array_append(result_tags, '#gamma_high');
  ELSIF gamma > 1.0 THEN
    result_tags := array_append(result_tags, '#gamma_medium');
  ELSIF gamma > 0 THEN
    result_tags := array_append(result_tags, '#gamma_low');
  ELSE
    result_tags := array_append(result_tags, '#gamma_negative');
  END IF;
  
  RETURN result_tags;
END;
$$;