-- Demo user
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  phone,
  phone_change,
  phone_change_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000001',
  'john@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  '{"sub":"a0000000-0000-4000-8000-000000000001","email":"john@example.com"}',
  'email',
  'a0000000-0000-4000-8000-000000000001',
  now(),
  now(),
  now()
);

-- Respondents
INSERT INTO respondents (respondent_id, wave, wave_id, weight, audience_category, age, gender, ethnicity, region, community_type, marital_status, household_size, education, employment_status, household_income_usd, investable_assets_usd, zip_code, state, dma, parent_status, political_affiliation, home_ownership) VALUES
(1001, 145, 9001, 1.21, 'Emerging Tech Professionals', 29, 'Female', 'Asian', 'West', 'Urban', 'Single', 1, 'Completed 4-year college', 'Work full-time', 118000, 85000, '94107', 'CA', 'San Francisco', 'Not the parent', 'Independent', 'Rent an apartment'),
(1002, 145, 9002, 1.08, 'Emerging Tech Professionals', 34, 'Male', 'White', 'Northeast', 'Urban', 'Living with someone', 2, 'Post-graduate degree', 'Work full-time', 142000, 120000, '10011', 'NY', 'New York', 'Not the parent', 'Democrat', 'Rent an apartment'),
(1003, 144, 9003, 0.97, 'Emerging Tech Professionals', 41, 'Non-Binary', 'Hispanic', 'West', 'Suburban', 'Married', 3, 'Post-graduate degree', 'Work full-time', 165000, 240000, '78704', 'TX', 'Austin', 'Parent', 'Democrat', 'Own a house'),
(1004, 145, 9004, 1.16, 'Wellness-Oriented Parents', 38, 'Female', 'Black', 'South', 'Suburban', 'Married', 4, 'Some college', 'Work full-time', 86000, 45000, '30309', 'GA', 'Atlanta', 'Parent', 'Democrat', 'Own a house'),
(1005, 145, 9005, 1.03, 'Wellness-Oriented Parents', 45, 'Male', 'Hispanic', 'West', 'Suburban', 'Married', 4, 'Completed 4-year college', 'Work full-time', 105000, 60000, '80211', 'CO', 'Denver', 'Parent', 'Independent', 'Own a house'),
(1006, 144, 9006, 1.11, 'Wellness-Oriented Parents', 36, 'Female', 'White', 'Midwest', 'Suburban', 'Living with someone', 3, 'Post-graduate degree', 'Work part-time', 92000, 90000, '60614', 'IL', 'Chicago', 'Parent', 'Democrat', 'Own a condo or a coop'),
(1007, 145, 9007, 1.18, 'Competitive Sports Fans', 27, 'Male', 'White', 'South', 'Urban', 'Single', 2, 'Some college', 'Work full-time', 72000, 15000, '75201', 'TX', 'Dallas', 'Not the parent', 'Republican', 'Rent an apartment'),
(1008, 145, 9008, 0.94, 'Competitive Sports Fans', 33, 'Female', 'Black', 'South', 'Suburban', 'Living with someone', 3, 'Completed 4-year college', 'Work full-time', 88000, 35000, '28203', 'NC', 'Charlotte', 'Parent', 'Independent', 'Own a house'),
(1009, 144, 9009, 1.05, 'Competitive Sports Fans', 31, 'Male', 'Hispanic', 'Midwest', 'Urban', 'Single', 2, 'High school graduate', 'Work part-time', 54000, 10000, '44113', 'OH', 'Cleveland', 'Not the parent', 'Independent', 'Rent an apartment'),
(1010, 145, 9010, 0.89, 'Affluent Culture Seekers', 52, 'Female', 'White', 'Northeast', 'Urban', 'Married', 2, 'Post-graduate degree', 'Retired', 210000, 900000, '02116', 'MA', 'Boston', 'Not the parent', 'Democrat', 'Own a condo or a coop'),
(1011, 145, 9011, 1.02, 'Affluent Culture Seekers', 47, 'Male', 'Asian', 'West', 'Urban', 'Married', 2, 'Post-graduate degree', 'Work full-time', 235000, 1250000, '98109', 'WA', 'Seattle', 'Parent', 'Independent', 'Own a house'),
(1012, 144, 9012, 0.96, 'Affluent Culture Seekers', 44, 'Female', 'Hispanic', 'West', 'Urban', 'Living with someone', 2, 'Completed 4-year college', 'Work full-time', 178000, 420000, '90048', 'CA', 'Los Angeles', 'Not the parent', 'Democrat', 'Own a condo or a coop');

-- Genres (genre_categories converted from pipe-delimited to text array)
INSERT INTO genres (genre_slug, genre_name, genre_categories) VALUES
('RQ.2.34', 'Coding / Robotics', ARRAY['Continuing Ed']),
('RQ.2.38', 'Cooking / Baking / Grilling', ARRAY['Food & Drink']),
('RQ.2.48', 'Documentary', ARRAY['Entertainment']),
('RQ.2.57', 'Fantasy Sports', ARRAY['Sports', 'Gaming']),
('RQ.2.78', 'How-To Content', ARRAY['Continuing Ed', 'Entertainment', 'Hobby']),
('RQ.2.97', 'Meditation', ARRAY['Personal Care']),
('RQ.2.125', 'Reality programming / Reality TV', ARRAY['Entertainment']),
('RQ.2.162', 'Travel & tourism content', ARRAY['Entertainment', 'Travel']),
('RQ.2.172', 'Wine', ARRAY['Food & Drink']),
('RQ.2.173', 'Yoga / Pilates', ARRAY['Sports', 'Personal Care']);

-- Respondent genre interest ratings
INSERT INTO respondent_genre_interests (respondent_id, genre_slug, interest_level) VALUES
(1001, 'RQ.2.34', 1),
(1001, 'RQ.2.38', 3),
(1001, 'RQ.2.48', 2),
(1001, 'RQ.2.57', 5),
(1001, 'RQ.2.78', 1),
(1001, 'RQ.2.97', 3),
(1001, 'RQ.2.125', 5),
(1001, 'RQ.2.162', 2),
(1001, 'RQ.2.172', 4),
(1001, 'RQ.2.173', 3),
(1002, 'RQ.2.34', 1),
(1002, 'RQ.2.38', 3),
(1002, 'RQ.2.48', 1),
(1002, 'RQ.2.57', 4),
(1002, 'RQ.2.78', 1),
(1002, 'RQ.2.97', 4),
(1002, 'RQ.2.125', 5),
(1002, 'RQ.2.162', 2),
(1002, 'RQ.2.172', 3),
(1002, 'RQ.2.173', 4),
(1003, 'RQ.2.34', 2),
(1003, 'RQ.2.38', 3),
(1003, 'RQ.2.48', 2),
(1003, 'RQ.2.57', 5),
(1003, 'RQ.2.78', 1),
(1003, 'RQ.2.97', 3),
(1003, 'RQ.2.125', 4),
(1003, 'RQ.2.162', 1),
(1003, 'RQ.2.172', 3),
(1003, 'RQ.2.173', 3),
(1004, 'RQ.2.34', 4),
(1004, 'RQ.2.38', 1),
(1004, 'RQ.2.48', 2),
(1004, 'RQ.2.57', 5),
(1004, 'RQ.2.78', 2),
(1004, 'RQ.2.97', 1),
(1004, 'RQ.2.125', 4),
(1004, 'RQ.2.162', 2),
(1004, 'RQ.2.172', 3),
(1004, 'RQ.2.173', 1),
(1005, 'RQ.2.34', 4),
(1005, 'RQ.2.38', 2),
(1005, 'RQ.2.48', 3),
(1005, 'RQ.2.57', 4),
(1005, 'RQ.2.78', 2),
(1005, 'RQ.2.97', 1),
(1005, 'RQ.2.125', 4),
(1005, 'RQ.2.162', 2),
(1005, 'RQ.2.172', 3),
(1005, 'RQ.2.173', 1),
(1006, 'RQ.2.34', 3),
(1006, 'RQ.2.38', 1),
(1006, 'RQ.2.48', 2),
(1006, 'RQ.2.57', 5),
(1006, 'RQ.2.78', 2),
(1006, 'RQ.2.97', 1),
(1006, 'RQ.2.125', 4),
(1006, 'RQ.2.162', 2),
(1006, 'RQ.2.172', 2),
(1006, 'RQ.2.173', 1),
(1007, 'RQ.2.34', 4),
(1007, 'RQ.2.38', 3),
(1007, 'RQ.2.48', 3),
(1007, 'RQ.2.57', 1),
(1007, 'RQ.2.78', 3),
(1007, 'RQ.2.97', 5),
(1007, 'RQ.2.125', 1),
(1007, 'RQ.2.162', 2),
(1007, 'RQ.2.172', 4),
(1007, 'RQ.2.173', 5),
(1008, 'RQ.2.34', 4),
(1008, 'RQ.2.38', 2),
(1008, 'RQ.2.48', 3),
(1008, 'RQ.2.57', 1),
(1008, 'RQ.2.78', 3),
(1008, 'RQ.2.97', 4),
(1008, 'RQ.2.125', 2),
(1008, 'RQ.2.162', 2),
(1008, 'RQ.2.172', 4),
(1008, 'RQ.2.173', 4),
(1009, 'RQ.2.34', 5),
(1009, 'RQ.2.38', 3),
(1009, 'RQ.2.48', 4),
(1009, 'RQ.2.57', 1),
(1009, 'RQ.2.78', 4),
(1009, 'RQ.2.97', 5),
(1009, 'RQ.2.125', 2),
(1009, 'RQ.2.162', 3),
(1009, 'RQ.2.172', 5),
(1009, 'RQ.2.173', 5),
(1010, 'RQ.2.34', 4),
(1010, 'RQ.2.38', 2),
(1010, 'RQ.2.48', 1),
(1010, 'RQ.2.57', 5),
(1010, 'RQ.2.78', 3),
(1010, 'RQ.2.97', 2),
(1010, 'RQ.2.125', 4),
(1010, 'RQ.2.162', 1),
(1010, 'RQ.2.172', 1),
(1010, 'RQ.2.173', 3),
(1011, 'RQ.2.34', 3),
(1011, 'RQ.2.38', 2),
(1011, 'RQ.2.48', 1),
(1011, 'RQ.2.57', 5),
(1011, 'RQ.2.78', 2),
(1011, 'RQ.2.97', 3),
(1011, 'RQ.2.125', 4),
(1011, 'RQ.2.162', 1),
(1011, 'RQ.2.172', 1),
(1011, 'RQ.2.173', 3),
(1012, 'RQ.2.34', 4),
(1012, 'RQ.2.38', 1),
(1012, 'RQ.2.48', 1),
(1012, 'RQ.2.57', 5),
(1012, 'RQ.2.78', 3),
(1012, 'RQ.2.97', 2),
(1012, 'RQ.2.125', 3),
(1012, 'RQ.2.162', 1),
(1012, 'RQ.2.172', 1),
(1012, 'RQ.2.173', 2);

-- Sample audience for demo user
INSERT INTO audiences (id, user_id, name, filters, manual_includes, manual_excludes) VALUES (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'Wellness-Oriented Parents',
  '{"audienceCategory": ["Wellness-Oriented Parents"]}',
  NULL,
  NULL
);

-- Precomputed genre summaries for Wellness-Oriented Parents (respondents 1004, 1005, 1006)
INSERT INTO audience_genre_summaries (audience_id, genre_slug, avg_interest, pct_highly_interested, respondent_count) VALUES
('a0000000-0000-4000-8000-000000000002', 'RQ.2.34',  3.6667, 0.6667, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.38',  1.3333, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.48',  2.3333, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.57',  4.6667, 1.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.78',  2.0000, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.97',  1.0000, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.125', 4.0000, 1.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.162', 2.0000, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.172', 2.6667, 0.0000, 3),
('a0000000-0000-4000-8000-000000000002', 'RQ.2.173', 1.0000, 0.0000, 3);

-- Pre-generated creative outputs (one per workflow type) for the sample audience
INSERT INTO creative_outputs (id, user_id, audience_id, type, content) VALUES
(
  'a0000000-0000-4000-8000-000000000010',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'persona',
  '{
    "name": "Jordan & Alex",
    "demographicSummary": "Suburban parents aged 35-45, predominantly female, living in the South, West, and Midwest. Household income ranges from $86K to $105K. Most are married with 3-4 person households and hold college or post-graduate degrees.",
    "topInterests": [
      {"genreName": "Meditation", "interestLevel": 1},
      {"genreName": "Yoga / Pilates", "interestLevel": 1},
      {"genreName": "Cooking / Baking / Grilling", "interestLevel": 1},
      {"genreName": "Travel & tourism content", "interestLevel": 2},
      {"genreName": "How-To Content", "interestLevel": 2}
    ],
    "lifestyleDescription": "Jordan and Alex are intentional suburban parents who prioritize wellness, family connection, and mindful consumption. They carve out time for yoga, meditation, and cooking healthy meals. Weekend activities revolve around outdoor exploration and hands-on learning with their kids.",
    "howToReachThem": "Target wellness and cooking content platforms, parenting podcasts, and travel-related streaming. Co-viewing CTV slots in the evening and wellness app sponsorships are high-attention placements for this audience."
  }'
),
(
  'a0000000-0000-4000-8000-000000000011',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'campaign',
  '{
    "concepts": [
      {
        "name": "Live Well, Play Hard",
        "tagline": "A life that feels as good as it looks.",
        "description": "Position healthy choices as smart plays for your family''s future, borrowing the strategy metaphor from sports and wellness culture.",
        "targetGenres": ["Meditation", "Yoga / Pilates", "Cooking / Baking / Grilling"],
        "suggestedFormat": "Connected TV series"
      },
      {
        "name": "Behind the Scenes",
        "tagline": "Real families. Real wellness. No filter.",
        "description": "Documentary-style content showing real families making wellness work in everyday life, not picture-perfect moments.",
        "targetGenres": ["Documentary", "Travel & tourism content"],
        "suggestedFormat": "Short-form social video"
      },
      {
        "name": "Weekend Win",
        "tagline": "Celebrate the small victories.",
        "description": "A family bike ride, a home-cooked meal, a Saturday screen-free morning. Celebrate the micro-moments that define a wellness-oriented household.",
        "targetGenres": ["Cooking / Baking / Grilling", "How-To Content"],
        "suggestedFormat": "Instagram Reels / Stories"
      }
    ]
  }'
),
(
  'a0000000-0000-4000-8000-000000000012',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'messaging',
  '{
    "angles": [
      {
        "name": "The Mindful Parent",
        "tone": "Warm, grounded",
        "sampleHeadline": "Wellness that fits your life, not the other way around.",
        "emotionalHook": "Speaks to the juggle of balancing career, parenting, and self-care without guilt.",
        "keyTrait": "Meditation interest + parent status"
      },
      {
        "name": "The Nourisher",
        "tone": "Inviting, practical",
        "sampleHeadline": "Simple enough for busy parents, effective enough for real results.",
        "emotionalHook": "Connects cooking passion with providing for the family.",
        "keyTrait": "Cooking / Baking interest + suburban lifestyle"
      },
      {
        "name": "The Explorer",
        "tone": "Aspirational, inclusive",
        "sampleHeadline": "Start your family''s next adventure this weekend.",
        "emotionalHook": "Taps into the desire for meaningful experiences over material possessions.",
        "keyTrait": "Travel interest + household income $85K+"
      }
    ]
  }'
),
(
  'a0000000-0000-4000-8000-000000000013',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'opportunity',
  '{
    "opportunities": [
      {
        "gapGenre": "Fantasy Sports",
        "audienceTrait": "Wellness-focused parents aged 35-45 with moderate-to-high household income",
        "crossoverConcept": "Fantasy wellness leagues where families compete on healthy habit streaks, blending the competitive engagement of fantasy sports with wellness goals.",
        "reasoning": "This audience rates Fantasy Sports as low interest (4.7 avg) but has high competitive drive from their sports-adjacent lifestyle. Gamifying wellness could bridge the gap.",
        "confidence": "medium"
      },
      {
        "gapGenre": "Reality programming / Reality TV",
        "audienceTrait": "Suburban parents who value authenticity and real-life storytelling",
        "crossoverConcept": "A reality series following wellness-oriented families through seasonal challenges, combining the voyeuristic appeal of reality TV with aspirational healthy living content.",
        "reasoning": "Low interest (4.0 avg) in traditional reality TV, but high interest in documentary and cooking content suggests appetite for authentic, unscripted formats.",
        "confidence": "high"
      },
      {
        "gapGenre": "Coding / Robotics",
        "audienceTrait": "Parents invested in children''s education and future skills",
        "crossoverConcept": "Family coding workshops marketed through wellness channels, positioning STEM education as part of a holistic approach to raising well-rounded children.",
        "reasoning": "Moderate disinterest (3.7 avg) in coding, but parent status and education level suggest openness to educational content framed as family enrichment.",
        "confidence": "medium"
      }
    ]
  }'
);
