class SessionManager {
    constructor(store) {
        this.store = store;
        this.currentSession = null;
        this.contextStack = [];
    }

    async startSession(projectName) {
        const context = await this.store.loadProjectContext(projectName);
        this.currentSession = {
            id: Date.now(),
            project: projectName,
            context,
            changes: [],
            patterns: [],
            contextStack: []
        };
        return this.currentSession;
    }

    async trackChange(change) {
        this.currentSession.changes.push({
            ...change,
            timestamp: new Date()
        });
        await this.store.saveChange(this.currentSession.id, change);
    }

    async createHandoff() {
        return {
            sessionId: this.currentSession.id,
            project: this.currentSession.project,
            context: this.currentSession.context,
            changes: this.currentSession.changes,
            patterns: this.currentSession.patterns,
            contextStack: this.currentSession.contextStack,
            handoffTime: new Date()
        };
    }

    async loadHandoff(handoff) {
        this.currentSession = {
            id: Date.now(),
            project: handoff.project,
            context: handoff.context,
            changes: [],
            patterns: handoff.patterns,
            contextStack: handoff.contextStack,
            previousSession: handoff.sessionId
        };
        return this.currentSession;
    }

    async pushContext(context) {
        this.currentSession.contextStack.push(this.currentSession.context);
        this.currentSession.context = context;
        await this.store.saveContext(this.currentSession.id, context);
    }

    async popContext() {
        if (this.currentSession.contextStack.length === 0) {
            throw new Error('Context stack is empty');
        }
        const previousContext = this.currentSession.contextStack.pop();
        this.currentSession.context = previousContext;
        await this.store.saveContext(this.currentSession.id, previousContext);
        return previousContext;
    }

    async createCheckpoint(description) {
        const checkpoint = {
            id: Date.now(),
            description,
            context: this.currentSession.context,
            changes: this.currentSession.changes,
            patterns: this.currentSession.patterns,
            timestamp: new Date()
        };
        await this.store.saveCheckpoint(this.currentSession.id, checkpoint);
        return checkpoint;
    }
}