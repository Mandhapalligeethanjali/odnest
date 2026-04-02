const pool = require('./db');

const initDB = async () => {
  try {

    // 1. USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('client', 'freelancer', 'admin')) NOT NULL,
        avatar VARCHAR(255),
        bio TEXT,
        location VARCHAR(100),
        skills TEXT[],
        hourly_rate DECIMAL(10,2),
        rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table ready');

    // 2. PROJECTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget DECIMAL(10,2) NOT NULL,
        skills_required TEXT[],
        deadline DATE,
        status VARCHAR(20) CHECK (status IN ('open','in_progress','completed','cancelled')) DEFAULT 'open',
        location VARCHAR(100),
        is_remote BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Projects table ready');

    // 3. BIDS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        proposal TEXT NOT NULL,
        delivery_days INT NOT NULL,
        status VARCHAR(20) CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Bids table ready');

    // 4. MILESTONES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE,
        status VARCHAR(20) CHECK (status IN ('pending','in_progress','submitted','approved','rejected')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Milestones table ready');

    // 5. PAYMENTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
        client_id UUID REFERENCES users(id),
        freelancer_id UUID REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        transaction_id VARCHAR(255),
        payment_method VARCHAR(20) CHECK (payment_method IN ('razorpay','stripe')),
        escrow_status VARCHAR(20) CHECK (escrow_status IN ('held','released','refunded')) DEFAULT 'held',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Payments table ready');

    // 6. MESSAGES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(255) NOT NULL,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Messages table ready');

    // 7. REVIEWS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Reviews table ready');

    // 8. DISPUTES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        raised_by UUID REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status VARCHAR(20) CHECK (status IN ('open','under_review','resolved')) DEFAULT 'open',
        resolution TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Disputes table ready');

    console.log('');
    console.log('🎉 All tables created successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    process.exit(1);
  }
};

initDB();