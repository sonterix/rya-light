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
-- Based on actual Wellness-Oriented Parents data: 3 respondents (IDs 1004-1006)
-- Demographics: ages 36-45, 67% female, all suburban, all parents, South/West/Midwest, income $86K-$105K
-- Top genres (1=highest interest): Meditation 1.0, Yoga/Pilates 1.0, Cooking 1.3, How-To 2.0, Travel 2.0
-- Gap genres (high score=low interest): Fantasy Sports 4.7, Reality TV 4.0, Coding 3.7, Wine 2.7
INSERT INTO creative_outputs (id, user_id, audience_id, type, content) VALUES
(
  'a0000000-0000-4000-8000-000000000010',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'persona',
  '{
    "name": "Maya Reeves",
    "demographicSummary": "Maya is a 38-year-old suburban mother living in the South. She represents a segment of 3 respondents aged 36-45, skewing female (67%), all suburban parents spread across the South, West, and Midwest. Household incomes range from $86K to $105K. Education levels are strong: some college to post-graduate degrees. Most work full-time.",
    "topInterests": [
      {"genreName": "Meditation", "interestLevel": 1},
      {"genreName": "Yoga / Pilates", "interestLevel": 1},
      {"genreName": "Cooking / Baking / Grilling", "interestLevel": 1.3},
      {"genreName": "How-To Content", "interestLevel": 2},
      {"genreName": "Travel & tourism content", "interestLevel": 2},
      {"genreName": "Documentary", "interestLevel": 2.3}
    ],
    "lifestyleDescription": "Maya starts her mornings with meditation or yoga before the household wakes up. She meal-preps on Sundays using recipes she bookmarks from cooking content throughout the week. Weekends are for family hikes, farmers markets, and the occasional documentary night after the kids are in bed. She values practical how-to content that helps her improve daily routines, from home organization to healthy eating. Travel content fuels her family vacation planning, though trips tend to be domestic and activity-focused rather than luxury getaways.",
    "howToReachThem": "Wellness and mindfulness app sponsorships during morning routines. Cooking and recipe platforms mid-week when she is planning meals. Parenting podcasts during her commute. Travel and documentary streaming platforms for evening co-viewing with her partner. Instagram and Facebook for community-driven content, especially around family wellness challenges."
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
        "name": "The Morning Ritual",
        "tagline": "Your day starts the night before.",
        "description": "A content series built around the morning routines of wellness-oriented parents. Each episode shows a real family''s meditation, yoga, or meal-prep ritual, connecting the product to the quiet moments before the day begins. Leverages 100% high-interest in meditation and yoga.",
        "targetGenres": ["Meditation", "Yoga / Pilates"],
        "suggestedFormat": "Short-form video series (Instagram Reels, TikTok)"
      },
      {
        "name": "Cook It Forward",
        "tagline": "Every meal is a lesson.",
        "description": "Partner with family cooking content creators to show parents teaching kids to cook healthy meals. Each piece ties the brand to the intersection of cooking passion (avg score 1.3) and parenting identity. Recipe cards double as product placements.",
        "targetGenres": ["Cooking / Baking / Grilling", "How-To Content"],
        "suggestedFormat": "Sponsored cooking content + recipe email series"
      },
      {
        "name": "48-Hour Family Reset",
        "tagline": "A weekend that changes your week.",
        "description": "A weekend travel challenge campaign where families document a 48-hour local adventure focused on wellness activities. Taps into travel interest (avg score 2.0) and the documentary sensibility (avg score 2.3) this audience already gravitates toward.",
        "targetGenres": ["Travel & tourism content", "Documentary"],
        "suggestedFormat": "Connected TV documentary shorts + social UGC campaign"
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
        "name": "The Intentional Parent",
        "tone": "Warm, grounded",
        "sampleHeadline": "Wellness that fits between school drop-off and bedtime.",
        "emotionalHook": "Acknowledges the time scarcity of working parents while validating that small wellness moments count.",
        "keyTrait": "Meditation + Yoga interest (avg 1.0) combined with full-time employment and parent status"
      },
      {
        "name": "The Family Nourisher",
        "tone": "Inviting, practical",
        "sampleHeadline": "Real food, real fast, really good for them.",
        "emotionalHook": "Connects the pride of home cooking with the pressure of feeding a family well on a busy schedule.",
        "keyTrait": "Cooking / Baking interest (avg 1.3) + suburban household with 3-4 members"
      },
      {
        "name": "The Curious Explorer",
        "tone": "Aspirational, inclusive",
        "sampleHeadline": "Your next family adventure is closer than you think.",
        "emotionalHook": "Taps into the desire for meaningful shared experiences over material consumption, grounded in domestic travel rather than luxury.",
        "keyTrait": "Travel & tourism interest (avg 2.0) + household income $86K-$105K"
      },
      {
        "name": "The Knowledge Seeker",
        "tone": "Empowering, direct",
        "sampleHeadline": "Learn something today that makes tomorrow easier.",
        "emotionalHook": "Speaks to the self-improvement drive of educated parents who consume how-to and documentary content to level up their routines.",
        "keyTrait": "How-To Content (avg 2.0) + Documentary (avg 2.3) interest + post-graduate education level"
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
        "audienceTrait": "Competitive parents aged 36-45 with strong community orientation and $86K-$105K income",
        "crossoverConcept": "Fantasy wellness leagues where families earn points for completing weekly wellness challenges (yoga sessions, new recipes tried, miles hiked). Leaderboards and seasonal competitions borrow the engagement mechanics of fantasy sports but redirect them toward health goals.",
        "reasoning": "Fantasy Sports scores 4.7 avg (near-unfamiliar) for this audience, but their deep engagement with meditation (1.0) and yoga (1.0) shows they already pursue goal-oriented wellness. Adding a competitive social layer could activate a latent interest in gamified health.",
        "confidence": "medium"
      },
      {
        "gapGenre": "Reality programming / Reality TV",
        "audienceTrait": "Suburban parents who value authenticity and already consume documentary content (avg 2.3)",
        "crossoverConcept": "An unscripted family wellness series where real households attempt 30-day health transformations. Unlike polished reality TV, it uses the documentary tone this audience prefers (avg 2.3) while delivering the relatable, unscripted format of reality programming.",
        "reasoning": "Reality TV scores 4.0 avg (low interest), but high interest in documentary (2.3) and cooking (1.3) content suggests appetite for real, unscripted storytelling. The gap is in traditional reality TV''s perceived inauthenticity, not in the format itself.",
        "confidence": "high"
      },
      {
        "gapGenre": "Coding / Robotics",
        "audienceTrait": "Educated parents (some college to post-graduate) invested in children''s development",
        "crossoverConcept": "Family STEM workshops marketed through wellness and how-to content channels, positioning coding education as a modern parenting essential alongside nutrition and mindfulness. Weekend coding camps paired with outdoor activities.",
        "reasoning": "Coding scores 3.7 avg (neutral-to-low), but this audience''s high education level and strong how-to content interest (avg 2.0) suggests openness to learning-oriented content when framed as family enrichment rather than technical skill-building.",
        "confidence": "medium"
      }
    ]
  }'
);
