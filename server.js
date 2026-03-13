// ============================================================
// 🍷 Story Night API Server
// Deploy on Railway alongside PostgreSQL
// Real-time voting via Socket.io
// ============================================================

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Railway auto-injects DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ============================================================
// Health check
// ============================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ============================================================
// EVENTS
// ============================================================

// Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { name = '故事之夜', event_date, table_count = 8, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO events (name, event_date, table_count, notes)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4)
       RETURNING *`,
      [name, event_date, table_count, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current/latest event
app.get('/api/events/current', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE status = 'active' ORDER BY created_at DESC LIMIT 1`
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event (e.g., set topics after wheel spin)
app.patch('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => fields[k]);
    const result = await pool.query(
      `UPDATE events SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PARTICIPANTS
// ============================================================

// Check in a participant
app.post('/api/participants', async (req, res) => {
  try {
    const { event_id, name, one_liner, table_name, table_index } = req.body;
    const result = await pool.query(
      `INSERT INTO participants (event_id, name, one_liner, table_name, table_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [event_id, name, one_liner, table_name, table_index]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all participants for an event
app.get('/api/events/:eventId/participants', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM participants WHERE event_id = $1 ORDER BY table_index, created_at`,
      [req.params.eventId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit follow-up form (update participant with contact info + interests)
app.post('/api/participants/followup', async (req, res) => {
  try {
    const { event_id, name, phone, table_name, interests } = req.body;

    // Try to find existing participant by name + event, or create new
    let result = await pool.query(
      `SELECT id FROM participants WHERE event_id = $1 AND name = $2 LIMIT 1`,
      [event_id, name]
    );

    if (result.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE participants 
         SET phone = $1, interests = $2, table_name = COALESCE($3, table_name)
         WHERE id = $4 RETURNING *`,
        [phone, interests, table_name, result.rows[0].id]
      );
    } else {
      // Create new participant record
      result = await pool.query(
        `INSERT INTO participants (event_id, name, phone, table_name, interests)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [event_id, name, phone, table_name, interests]
      );
    }

    res.json({ success: true, participant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark participant as table representative
app.patch('/api/participants/:id/rep', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE participants SET is_table_rep = TRUE WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update follow-up status
app.patch('/api/participants/:id/followup', async (req, res) => {
  try {
    const { followup_status, followup_notes, followup_by } = req.body;
    const result = await pool.query(
      `UPDATE participants 
       SET followup_status = COALESCE($1, followup_status),
           followup_notes = COALESCE($2, followup_notes),
           followup_by = COALESCE($3, followup_by)
       WHERE id = $4 RETURNING *`,
      [followup_status, followup_notes, followup_by, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// VOTES
// ============================================================

// Submit a vote (and broadcast via Socket.io)
app.post('/api/votes', async (req, res) => {
  try {
    const { event_id, round, storyteller_id, voter_name, score_story, score_expression, score_resonance } = req.body;
    const result = await pool.query(
      `INSERT INTO votes (event_id, round, storyteller_id, voter_name, score_story, score_expression, score_resonance)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [event_id, round, storyteller_id, voter_name, score_story, score_expression, score_resonance]
    );

    // Update storyteller's total score
    await pool.query(
      `UPDATE participants SET total_score = (
        SELECT COALESCE(SUM(total_score), 0) FROM votes WHERE storyteller_id = $1
      ) WHERE id = $1`,
      [storyteller_id]
    );

    // Get updated leaderboard for this round
    const leaderboard = await pool.query(
      `SELECT 
        p.id, p.name, p.table_name, p.table_index,
        COALESCE(SUM(v.total_score), 0) AS total_score,
        COUNT(v.id) AS vote_count
       FROM participants p
       LEFT JOIN votes v ON v.storyteller_id = p.id AND v.round = $2
       WHERE p.event_id = $1 AND p.is_table_rep = TRUE
       GROUP BY p.id
       ORDER BY total_score DESC`,
      [event_id, round]
    );

    const vote = result.rows[0];

    // 🔴 Broadcast to all clients in this event room
    io.to(`event:${event_id}`).emit('vote:new', {
      vote,
      storyteller_id,
      round,
      total: vote.total_score,
      leaderboard: leaderboard.rows,
    });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get votes for a round (for live leaderboard)
app.get('/api/events/:eventId/votes/:round', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, p.name, p.table_name, p.table_index,
        COALESCE(SUM(v.total_score), 0) AS total_score,
        COUNT(v.id) AS vote_count
       FROM participants p
       LEFT JOIN votes v ON v.storyteller_id = p.id AND v.round = $2
       WHERE p.event_id = $1 AND p.is_table_rep = TRUE
       GROUP BY p.id
       ORDER BY total_score DESC`,
      [req.params.eventId, req.params.round]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// LEADERBOARD & DASHBOARD
// ============================================================

// Full leaderboard for an event
app.get('/api/events/:eventId/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM leaderboard WHERE event_id = $1`,
      [req.params.eventId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow-up dashboard
app.get('/api/followup', async (req, res) => {
  try {
    const { event_id, status } = req.query;
    let query = `SELECT * FROM followup_dashboard WHERE 1=1`;
    const params = [];
    if (event_id) { params.push(event_id); query += ` AND event_id = $${params.length}`; }
    if (status) { params.push(status); query += ` AND followup_status = $${params.length}`; }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// STATS
// ============================================================

app.get('/api/events/:eventId/stats', async (req, res) => {
  try {
    const eid = req.params.eventId;
    const [participants, votes, interests] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, COUNT(phone) as with_contact FROM participants WHERE event_id = $1`, [eid]),
      pool.query(`SELECT COUNT(*) as total, round FROM votes WHERE event_id = $1 GROUP BY round`, [eid]),
      pool.query(
        `SELECT unnest(interests) as interest, COUNT(*) as count 
         FROM participants WHERE event_id = $1 AND interests IS NOT NULL 
         GROUP BY interest ORDER BY count DESC`, [eid]
      ),
    ]);
    res.json({
      participants: participants.rows[0],
      votes_by_round: votes.rows,
      interest_breakdown: interests.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Socket.io Real-time Events
// ============================================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join an event room (all devices for one event share a room)
  socket.on('join:event', (eventId) => {
    socket.join(`event:${eventId}`);
    console.log(`📍 ${socket.id} joined event:${eventId}`);
  });

  // Host broadcasts screen changes to all projectors
  socket.on('host:screen', (data) => {
    socket.to(`event:${data.event_id}`).emit('screen:change', data);
  });

  // Host triggers spin wheel on projector
  socket.on('host:spin', (data) => {
    socket.to(`event:${data.event_id}`).emit('wheel:spin', data);
  });

  // Host advances to next storyteller
  socket.on('host:next-storyteller', (data) => {
    socket.to(`event:${data.event_id}`).emit('storyteller:change', data);
  });

  // Host starts/stops timer
  socket.on('host:timer', (data) => {
    socket.to(`event:${data.event_id}`).emit('timer:update', data);
  });

  // Audience check-in notification
  socket.on('checkin', (data) => {
    socket.to(`event:${data.event_id}`).emit('checkin:new', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ============================================================
// Initialize DB schema on startup
// ============================================================
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

const PORT = process.env.PORT || 3000;
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🍷 Story Night API + WebSocket running on port ${PORT}`);
  });
});
