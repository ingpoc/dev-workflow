class WorkflowIntegration {
  constructor() {
    this.mongo = new MongoClient();
    this.sqlite = new SQLiteClient();
  }

  async trackPattern(patternId, context) {
    await this.mongo.updateOne('patterns', 
      { _id: patternId },
      { 
        $inc: { 'usageStats.count': 1 },
        $push: { 'usageStats.contexts': context }
      }
    );
  }

  async saveCheckpoint(projectId, state) {
    const checkpoint = await this.sqlite.insert('project_checkpoints', {
      project_id: projectId,
      state: JSON.stringify(state)
    });
    
    await this.mongo.updateOne('projects',
      { _id: projectId },
      { $push: { checkpoints: checkpoint.id }}
    );
  }

  async loadProjectState(projectId) {
    const sqliteState = await this.sqlite.getLatestState(projectId);
    const mongoState = await this.mongo.findOne('projects', { _id: projectId });
    
    return {
      ...mongoState,
      currentState: sqliteState
    };
  }
}