const Task = require('../models/Task');

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      due_date,
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, status, priority } = req.query;
    const isAdmin = req.user.role === 'admin';

    let tasks;
    let total;

    if (isAdmin) {
      // Admin can see all tasks
      tasks = await Task.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        priority,
      });
      total = await Task.count(null, { status, priority });
    } else {
      // Users see only their tasks
      tasks = await Task.findByUserId(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        priority,
      });
      total = await Task.count(req.user.id, { status, priority });
    }

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user owns the task or is admin
    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const isAdmin = req.user.role === 'admin';

    const task = await Task.update(
      req.params.id,
      req.user.id,
      { title, description, status, priority, due_date },
      isAdmin
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const deleted = await Task.delete(req.params.id, req.user.id, isAdmin);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/v1/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.getStats(req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
