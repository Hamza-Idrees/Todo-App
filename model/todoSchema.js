const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const todoListSchema = new Schema({
  taskName: {
    type: String,
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = model("Todo", todoListSchema);
