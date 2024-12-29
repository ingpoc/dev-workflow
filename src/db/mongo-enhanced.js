import mongoose from 'mongoose';
import { EventEmitter } from 'events';

class DatabaseManager extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev-workflow';
  }

  async connect() {
    try {
      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      
      this.isConnected = true;
      this.emit('connected');
      
      mongoose.connection.on('error', (error) => {
        this.isConnected = false;
        this.emit('error', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        this.emit('disconnected');
        this.reconnect();
      });
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async reconnect() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      this.emit('disconnected');
    }
  }
}

const dbManager = new DatabaseManager();
export default dbManager;