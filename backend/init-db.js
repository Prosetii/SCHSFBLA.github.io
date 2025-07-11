const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Initialize database
async function initDatabase() {
  console.log('🗄️  Initializing SCHS FBLA database...');

  return new Promise((resolve, reject) => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err);
        reject(err);
        return;
      }
      console.log('✅ Users table created successfully');

      // Create sessions table for JWT token blacklisting
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          token_hash TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating sessions table:', err);
          reject(err);
          return;
        }
        console.log('✅ Sessions table created successfully');

        // Insert initial users
        insertInitialUsers()
          .then(() => {
            console.log('✅ Database initialization complete!');
            resolve();
          })
          .catch(reject);
      });
    });
  });
}

// Insert initial users
async function insertInitialUsers() {
  const users = [
    {
      username: 'SethD',
      password: 'VIII',
      role: 'admin'
    },
    {
      username: 'JosiahB',
      password: 'Bread25!',
      role: 'student'
    }
  ];

  for (const user of users) {
    try {
      const passwordHash = await bcrypt.hash(user.password, 12);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR REPLACE INTO users (username, password_hash, role)
          VALUES (?, ?, ?)
        `, [user.username, passwordHash, user.role], function(err) {
          if (err) {
            console.error(`❌ Error inserting user ${user.username}:`, err);
            reject(err);
          } else {
            console.log(`✅ User ${user.username} created/updated successfully`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error hashing password for ${user.username}:`, error);
    }
  }
}

// Run initialization
initDatabase()
  .then(() => {
    console.log('🎉 Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  })
  .finally(() => {
    db.close();
  }); 