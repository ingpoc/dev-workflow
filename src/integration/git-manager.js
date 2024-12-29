import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import contextManager from '../context/manager';

const execAsync = promisify(exec);

class GitManager {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.hooks = new Map();
    this.setupHooks();
  }

  async setupHooks() {
    const hooksPath = path.join(this.repoPath, '.git', 'hooks');
    
    const hooks = {
      'pre-commit': this.generatePreCommitHook(),
      'post-commit': this.generatePostCommitHook(),
      'pre-push': this.generatePrePushHook()
    };

    for (const [hookName, hookContent] of Object.entries(hooks)) {
      const hookPath = path.join(hooksPath, hookName);
      await fs.writeFile(hookPath, hookContent);
      await fs.chmod(hookPath, '755');
    }
  }

  generatePreCommitHook() {
    return `#!/bin/sh
    node ${path.join(__dirname, 'hooks', 'pre-commit.js')}
    `;
  }

  generatePostCommitHook() {
    return `#!/bin/sh
    node ${path.join(__dirname, 'hooks', 'post-commit.js')}
    `;
  }

  generatePrePushHook() {
    return `#!/bin/sh
    node ${path.join(__dirname, 'hooks', 'pre-push.js')}
    `;
  }

  async createCheckpoint(message) {
    const state = await contextManager.getState(this.repoPath);
    
    try {
      await execAsync('git add .', { cwd: this.repoPath });
      await execAsync(`git commit -m "Checkpoint: ${message}"`, { cwd: this.repoPath });
      
      const { stdout: commitHash } = await execAsync('git rev-parse HEAD', { cwd: this.repoPath });
      
      await contextManager.saveState(this.repoPath, {
        ...state,
        gitHash: commitHash.trim(),
        checkpointMessage: message
      });

      return commitHash.trim();
    } catch (error) {
      console.error('Checkpoint creation failed:', error);
      throw error;
    }
  }

  async restoreCheckpoint(commitHash) {
    try {
      await execAsync(`git checkout ${commitHash}`, { cwd: this.repoPath });
      const state = await contextManager.getState(this.repoPath);
      
      if (state?.gitHash === commitHash) {
        await contextManager.rollback(this.repoPath, state.version);
      }
      
      return true;
    } catch (error) {
      console.error('Checkpoint restoration failed:', error);
      throw error;
    }
  }

  async getCheckpoints() {
    try {
      const { stdout } = await execAsync(
        'git log --pretty=format:"%H|%s|%ai"',
        { cwd: this.repoPath }
      );
      
      return stdout.split('\n').map(line => {
        const [hash, message, date] = line.split('|');
        return { hash, message, date };
      });
    } catch (error) {
      console.error('Failed to get checkpoints:', error);
      throw error;
    }
  }
}

export default GitManager;