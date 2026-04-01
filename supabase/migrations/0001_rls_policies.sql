-- Enable RLS on all tables
ALTER TABLE "respondents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "genres" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "respondent_genre_interests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audience_genre_summaries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "creative_outputs" ENABLE ROW LEVEL SECURITY;

-- Seed-data tables: SELECT only for authenticated users
CREATE POLICY "respondents_select" ON "respondents"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "genres_select" ON "genres"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "respondent_genre_interests_select" ON "respondent_genre_interests"
  FOR SELECT TO authenticated USING (true);

-- Audiences: full CRUD scoped to user_id = auth.uid()
CREATE POLICY "audiences_select" ON "audiences"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "audiences_insert" ON "audiences"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "audiences_update" ON "audiences"
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "audiences_delete" ON "audiences"
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Audience genre summaries: SELECT only through audience ownership
CREATE POLICY "audience_genre_summaries_select" ON "audience_genre_summaries"
  FOR SELECT TO authenticated
  USING (audience_id IN (SELECT id FROM audiences WHERE user_id = auth.uid()));

-- Creative outputs: full CRUD scoped to user_id = auth.uid()
CREATE POLICY "creative_outputs_select" ON "creative_outputs"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "creative_outputs_insert" ON "creative_outputs"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "creative_outputs_update" ON "creative_outputs"
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "creative_outputs_delete" ON "creative_outputs"
  FOR DELETE TO authenticated USING (user_id = auth.uid());
