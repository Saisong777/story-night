-- ============================================================
-- 🍷 我有酒，你有故事嗎？ - Story Night PostgreSQL Schema
-- Railway PostgreSQL Database
-- ============================================================

-- 1. Events table: one record per event night
CREATE TABLE IF NOT EXISTS events (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL DEFAULT '故事之夜',
  event_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  table_count   INT NOT NULL DEFAULT 8,
  round1_topic  VARCHAR(100),
  round2_topic  VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'active',  -- active, completed, archived
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participants table: every person who checks in
CREATE TABLE IF NOT EXISTS participants (
  id            SERIAL PRIMARY KEY,
  event_id      INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  one_liner     VARCHAR(300),
  phone         VARCHAR(100),
  table_name    VARCHAR(50),       -- 威士忌, 紅酒, etc.
  table_index   INT,
  interests     TEXT[],            -- ARRAY: '想認識信仰', '想加入小組', etc.
  story_summary TEXT,              -- recap of their story
  total_score   INT DEFAULT 0,
  is_table_rep  BOOLEAN DEFAULT FALSE,
  followup_status VARCHAR(30) DEFAULT '待跟進',  -- 待跟進, 已聯繫, 已加入小組, 持續關懷
  followup_notes TEXT,
  followup_by   VARCHAR(100),      -- person responsible for follow-up
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Votes table: every individual vote cast
CREATE TABLE IF NOT EXISTS votes (
  id              SERIAL PRIMARY KEY,
  event_id        INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round           INT NOT NULL,         -- 1 or 2
  storyteller_id  INT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  voter_name      VARCHAR(100),          -- optional: who voted
  score_story     INT NOT NULL CHECK (score_story BETWEEN 1 AND 5),
  score_expression INT NOT NULL CHECK (score_expression BETWEEN 1 AND 5),
  score_resonance INT NOT NULL CHECK (score_resonance BETWEEN 1 AND 5),
  total_score     INT GENERATED ALWAYS AS (score_story + score_expression + score_resonance) STORED,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_table ON participants(event_id, table_index);
CREATE INDEX IF NOT EXISTS idx_votes_event_round ON votes(event_id, round);
CREATE INDEX IF NOT EXISTS idx_votes_storyteller ON votes(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_participants_followup ON participants(followup_status);

-- ============================================================
-- Useful Views
-- ============================================================

-- Leaderboard view: total scores per storyteller per event
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.event_id,
  p.name,
  p.table_name,
  p.table_index,
  p.is_table_rep,
  COALESCE(SUM(v.total_score), 0) AS total_score,
  COUNT(v.id) AS vote_count,
  ROUND(AVG(v.total_score)::numeric, 1) AS avg_score
FROM participants p
LEFT JOIN votes v ON v.storyteller_id = p.id
WHERE p.is_table_rep = TRUE
GROUP BY p.id
ORDER BY total_score DESC;

-- Follow-up dashboard view
CREATE OR REPLACE VIEW followup_dashboard AS
SELECT
  p.id,
  p.name,
  p.phone,
  p.table_name,
  p.interests,
  p.story_summary,
  p.followup_status,
  p.followup_by,
  p.followup_notes,
  e.name AS event_name,
  e.event_date,
  p.created_at
FROM participants p
JOIN events e ON e.id = p.event_id
WHERE p.phone IS NOT NULL AND p.phone != ''
ORDER BY 
  CASE p.followup_status
    WHEN '待跟進' THEN 1
    WHEN '已聯繫' THEN 2
    WHEN '已加入小組' THEN 3
    WHEN '持續關懷' THEN 4
    ELSE 5
  END,
  p.created_at DESC;
