CREATE TABLE public.daily_quizzes (
  date_key TEXT PRIMARY KEY,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_quizzes TO anon, authenticated;
GRANT ALL ON public.daily_quizzes TO service_role;

ALTER TABLE public.daily_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read daily quizzes"
  ON public.daily_quizzes FOR SELECT
  TO anon, authenticated
  USING (true);