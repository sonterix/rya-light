-- Demo user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'john@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
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
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"john@example.com"}',
  'email',
  '00000000-0000-0000-0000-000000000001',
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
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Wellness-Oriented Parents',
  '{"audience_category": "Wellness-Oriented Parents"}',
  NULL,
  NULL
);

-- Precomputed genre summaries for Wellness-Oriented Parents (respondents 1004, 1005, 1006)
INSERT INTO audience_genre_summaries (audience_id, genre_slug, avg_interest, pct_highly_interested, respondent_count) VALUES
('00000000-0000-0000-0000-000000000002', 'RQ.2.34',  3.6667, 0.6667, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.38',  1.3333, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.48',  2.3333, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.57',  4.6667, 1.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.78',  2.0000, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.97',  1.0000, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.125', 4.0000, 1.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.162', 2.0000, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.172', 2.6667, 0.0000, 3),
('00000000-0000-0000-0000-000000000002', 'RQ.2.173', 1.0000, 0.0000, 3);

-- Pre-generated creative outputs (one per workflow type) for the sample audience
INSERT INTO creative_outputs (id, user_id, audience_id, type, content) VALUES
(
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'persona',
  '{
    "name": "Jordan & Alex",
    "age_range": "35-45",
    "tagline": "Intentional Parents Building a Balanced Life",
    "overview": "Jordan and Alex are suburban parents in their late 30s to mid 40s who prioritize wellness, family connection, and mindful consumption. They work full-time but carve out time for activities that nourish body and mind. Fantasy sports and reality TV offer them low-effort entertainment after demanding days, while Coding content reflects their curiosity about technology for their children''s futures.",
    "motivations": ["Raising healthy, well-rounded kids", "Staying active and mentally sharp", "Finding community with like-minded families", "Making intentional purchases that align with their values"],
    "media_habits": ["Streams reality TV in the evenings as a couple", "Follows fantasy sports leagues with friends online", "Watches how-to and coding content on weekends", "Listens to wellness podcasts during commutes"],
    "pain_points": ["Time scarcity — balancing career, parenting, and self-care", "Information overload when researching healthy products", "Feeling like wellness culture is expensive or exclusive"],
    "top_genres": ["Fantasy Sports", "Reality programming / Reality TV", "Coding / Robotics", "Documentary"]
  }'
),
(
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'campaign',
  '{
    "campaign_name": "Live Well, Play Hard",
    "objective": "Drive brand awareness and trial among wellness-oriented suburban parents aged 35-45",
    "core_message": "You deserve a life that feels as good as it looks — for you and your family.",
    "channels": ["Connected TV", "Streaming audio", "Social media (Instagram, Facebook)", "Fantasy sports platform placements"],
    "creative_angles": [
      {
        "angle": "The Game Plan",
        "description": "Borrow the strategy metaphor from fantasy sports — positioning healthy choices as smart plays for your family''s future."
      },
      {
        "angle": "Behind the Scenes",
        "description": "Documentary-style content showing real families making wellness work in everyday life, not picture-perfect moments."
      },
      {
        "angle": "Weekend Win",
        "description": "Celebrate the small victories — a family bike ride, a home-cooked meal, a Saturday screen-free morning."
      }
    ],
    "kpis": ["Brand recall lift", "Trial/purchase intent", "Engagement rate on social placements", "CTV completion rate"]
  }'
),
(
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'messaging',
  '{
    "primary_message": "Built for families who take wellness seriously — without taking themselves too seriously.",
    "value_propositions": [
      "Simple enough for busy parents, effective enough for real results",
      "Trusted by families who balance ambition with intention",
      "Wellness that fits your life, not the other way around"
    ],
    "tone_guidance": "Warm, grounded, and real. Avoid aspirational perfection. Speak to the juggle, not the highlight reel. Use inclusive language that acknowledges diverse family structures.",
    "proof_points": [
      "Used by parents across suburban communities in the South, West, and Midwest",
      "Endorsed by coaches and wellness educators",
      "Simple ingredient lists / transparent sourcing"
    ],
    "calls_to_action": [
      "Try it this weekend",
      "Start your family''s wellness journey",
      "See how other families do it"
    ],
    "avoid": ["Guilt-based messaging", "Unrealistic body or lifestyle imagery", "Overly clinical language"]
  }'
),
(
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'opportunity',
  '{
    "headline": "A High-Intent Audience Hiding in Plain Sight",
    "summary": "Wellness-Oriented Parents represent a premium, underserved audience segment that sits at the intersection of high purchase intent, above-average household income, and strong media engagement. Their affinity for fantasy sports, reality TV, and how-to content creates diverse and cost-effective media entry points.",
    "market_size_context": "Suburban parents aged 35-45 with household incomes above $85K represent a significant share of CPG, health & wellness, and family services spending.",
    "competitive_gap": "Most wellness brands skew messaging toward younger, childless adults or older empty-nesters. This audience is underserved by campaigns that speak to their dual identity as active parents and wellness seekers.",
    "media_opportunities": [
      {
        "channel": "Fantasy Sports Platforms",
        "rationale": "100% of this segment rated Fantasy Sports 4 or 5. Pre-game and league management moments offer high-attention placements."
      },
      {
        "channel": "Reality TV / Streaming",
        "rationale": "All three respondents rated Reality TV at 4. Evening co-viewing with partners creates shared brand moments."
      },
      {
        "channel": "How-To and Coding Content",
        "rationale": "Moderate interest suggests openness to educational content that helps them support their children''s development."
      }
    ],
    "recommended_next_steps": [
      "Activate a test campaign on fantasy sports platforms targeting suburban parent segments",
      "Develop co-viewing creative optimized for CTV reality programming slots",
      "Explore educational content partnerships aligned with coding and how-to interest"
    ]
  }'
);
