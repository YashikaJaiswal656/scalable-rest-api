const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Insert admin user
    await pool.query(
      `INSERT IGNORE INTO users (username, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      ['admin', 'admin@example.com', adminPassword, 'admin']
    );

    console.log('✅ Admin user created');

    // Insert regular user
    await pool.query(
      `INSERT IGNORE INTO users (username, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      ['john_doe', 'john@example.com', userPassword, 'user']
    );

    console.log('✅ Regular user created');

    // Get user ID
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', ['john@example.com']);
    const userId = users[0].id;

    // Insert sample tasks
    const tasks = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation with examples',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Deploy to production',
        description: 'Deploy latest changes to production environment',
        status: 'pending',
        priority: 'urgent',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Team meeting',
        description: 'Weekly sync with the development team',
        status: 'completed',
        priority: 'low',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const task of tasks) {
      await pool.query(
        `INSERT INTO tasks (title, description, status, priority, due_date, user_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [task.title, task.description, task.status, task.priority, task.due_date, userId]
      );
    }

    console.log('✅ Sample tasks created');
    console.log('\n📋 Seed Data Summary:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: john@example.com / user123');
    console.log('🎉 Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
