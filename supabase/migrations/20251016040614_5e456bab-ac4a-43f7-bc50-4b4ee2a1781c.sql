-- Исправление функции с установкой search_path для безопасности
CREATE OR REPLACE FUNCTION public.generate_hypothesis_tags(
  domains TEXT[],
  status TEXT,
  gamma DECIMAL
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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