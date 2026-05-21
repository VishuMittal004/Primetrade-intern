'use strict';

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Allow null/undefined, only validate if provided
          if (!value) return true;
          return value >= new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Cannot have more than 10 tags',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have an owner'],
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for query performance ───────────────────────────────────────────
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, priority: 1 });
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' }); // Full-text search

// ─── Virtual: isOverdue ───────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && this.status !== 'done';
});

// ─── Pre-save: normalize tags ─────────────────────────────────────────────────
taskSchema.pre('save', function (next) {
  if (this.isModified('tags')) {
    // Lowercase and deduplicate tags
    this.tags = [...new Set(this.tags.map((t) => t.toLowerCase().trim()))].filter(Boolean);
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
