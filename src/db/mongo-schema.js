const patternSchema = {
  name: String,
  category: String,
  implementation: Object,
  usageStats: {
    count: Number,
    lastUsed: Date,
    successRate: Number,
    contexts: Array
  },
  metadata: {
    created: Date,
    updated: Date,
    version: Number
  }
};

const projectSchema = {
  name: String,
  status: String,
  activePatterns: Array,
  context: Object,
  checkpoints: Array,
  metadata: {
    created: Date,
    updated: Date,
    sessions: Array
  }
};