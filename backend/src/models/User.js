const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create({ username, email, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    
    const sql = `
      INSERT INTO users (username, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query(sql, [username, email, hashedPassword, role]);
    return { id: result.insertId, username, email, role };
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Find user by email (with password for authentication)
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = 'SELECT id, username, email, role, created_at FROM users WHERE username = ?';
    const results = await query(sql, [username]);
    return results[0] || null;
  }

  // Get all users (admin only)
  static async findAll({ limit = 10, offset = 0, role }) {
    let sql = 'SELECT id, username, email, role, created_at, updated_at FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update user
  static async update(id, updates) {
    const allowedFields = ['username', 'email', 'role'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    
    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return await this.findById(id);
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Count users
  static async count(role) {
    let sql = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    const results = await query(sql, params);
    return results[0].total;
  }
}

module.exports = User;
