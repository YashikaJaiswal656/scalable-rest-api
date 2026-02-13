const { query } = require('../config/database');

class Task {
  // Create a new task
  static async create({ title, description, status = 'pending', priority = 'medium', due_date, user_id }) {
    const sql = `
      INSERT INTO tasks (title, description, status, priority, due_date, user_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [title, description, status, priority, due_date, user_id]);
    return await this.findById(result.insertId);
  }

  // Find task by ID
  static async findById(id) {
    const sql = `
      SELECT t.*, u.username, u.email 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Find tasks by user ID
  static async findByUserId(userId, { limit = 10, offset = 0, status, priority }) {
    let sql = `
      SELECT * FROM tasks 
      WHERE user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Get all tasks (admin only)
  static async findAll({ limit = 10, offset = 0, status, priority, user_id }) {
    let sql = `
      SELECT t.*, u.username, u.email 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    if (user_id) {
      sql += ' AND t.user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update task
  static async update(id, userId, updates, isAdmin = false) {
    // Verify ownership unless admin
    if (!isAdmin) {
      const task = await this.findById(id);
      if (!task || task.user_id !== userId) {
        throw new Error('Task not found or unauthorized');
      }
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    
    const sql = `UPDATE tasks SET ${setClause} WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return await this.findById(id);
  }

  // Delete task
  static async delete(id, userId, isAdmin = false) {
    // Verify ownership unless admin
    if (!isAdmin) {
      const task = await this.findById(id);
      if (!task || task.user_id !== userId) {
        throw new Error('Task not found or unauthorized');
      }
    }

    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Count tasks
  static async count(userId, filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM tasks WHERE 1=1';
    const params = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    const results = await query(sql, params);
    return results[0].total;
  }

  // Get task statistics
  static async getStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM tasks 
      WHERE user_id = ?
    `;
    const results = await query(sql, [userId]);
    return results[0];
  }
}

module.exports = Task;
