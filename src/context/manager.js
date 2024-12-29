import dbManager from '../db/mongo-enhanced';
import { EventEmitter } from 'events';

class ContextManager extends EventEmitter {
  constructor() {
    super();
    this.states = new Map();
    this.history = [];
    this.currentVersion = 0;
  }

  async saveState(projectId, state) {
    const version = this.currentVersion + 1;
    const timestamp = Date.now();
    
    const stateEntry = {
      version,
      timestamp,
      state: JSON.parse(JSON.stringify(state)),
      projectId
    };

    this.history.push(stateEntry);
    this.states.set(projectId, stateEntry);
    this.currentVersion = version;
    
    await this.persistState(stateEntry);
    this.emit('stateUpdated', stateEntry);
    
    return version;
  }

  async rollback(projectId, version) {
    const historyEntry = this.history.find(
      entry => entry.projectId === projectId && entry.version === version
    );

    if (!historyEntry) {
      throw new Error(`Version ${version} not found`);
    }

    const restoredState = JSON.parse(JSON.stringify(historyEntry.state));
    this.states.set(projectId, {
      ...historyEntry,
      timestamp: Date.now(),
      version: this.currentVersion + 1
    });

    this.currentVersion++;
    this.emit('stateRollback', {
      projectId,
      fromVersion: version,
      toVersion: this.currentVersion
    });

    return restoredState;
  }

  async persistState(stateEntry) {
    if (dbManager.isConnected) {
      const StateModel = mongoose.model('State');
      await StateModel.create({
        projectId: stateEntry.projectId,
        version: stateEntry.version,
        timestamp: stateEntry.timestamp,
        state: stateEntry.state
      });
    }
  }

  getState(projectId) {
    return this.states.get(projectId)?.state;
  }

  getHistory(projectId) {
    return this.history.filter(entry => entry.projectId === projectId);
  }
}

const contextManager = new ContextManager();
export default contextManager;