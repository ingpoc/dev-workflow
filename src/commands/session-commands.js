class SessionCommands {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    async start(projectName) {
        const session = await this.sessionManager.startSession(projectName);
        return `Session started for ${projectName}`;
    }

    async track(changeType, details) {
        await this.sessionManager.trackChange({ type: changeType, details });
        return `Tracked ${changeType}`;
    }

    async handoff() {
        const handoff = await this.sessionManager.createHandoff();
        return `!load-handoff ${JSON.stringify(handoff)}`;
    }

    async loadHandoff(handoffData) {
        const session = await this.sessionManager.loadHandoff(JSON.parse(handoffData));
        return `Resumed session for ${session.project}`;
    }

    async pushContext(context) {
        await this.sessionManager.pushContext(context);
        return `Pushed new context`;
    }

    async popContext() {
        const context = await this.sessionManager.popContext();
        return `Restored context: ${context.name}`;
    }

    async createCheckpoint(description) {
        const checkpoint = await this.sessionManager.createCheckpoint(description);
        return `Created checkpoint: ${checkpoint.id}`;
    }
}