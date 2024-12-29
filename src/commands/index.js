class CommandProcessor {
    constructor(integration) {
        this.integration = integration;
        this.commands = {
            'load': this.loadProject.bind(this),
            'status': this.getStatus.bind(this),
            'checkpoint': this.createCheckpoint.bind(this),
            'pattern': this.getPattern.bind(this)
        };
    }

    async process(command, args) {
        const cmd = this.parseCommand(command);
        if (this.commands[cmd]) {
            return await this.commands[cmd](...args);
        }
        throw new Error(`Unknown command: ${command}`);
    }

    parseCommand(input) {
        if (!input.startsWith('!')) return null;
        return input.slice(1).split(' ')[0];
    }

    async loadProject(projectName) {
        const state = await this.integration.loadProjectState(projectName);
        return `Loaded project ${projectName}\nStatus: ${state.status}`;
    }

    async getStatus() {
        const state = await this.integration.getCurrentState();
        return JSON.stringify(state, null, 2);
    }

    async createCheckpoint(message) {
        await this.integration.saveCheckpoint(message);
        return `Checkpoint created: ${message}`;
    }

    async getPattern(category) {
        const pattern = await this.integration.getRecommendedPattern(category);
        return `Recommended pattern: ${pattern.name}\nSuccess rate: ${pattern.usageStats.successRate}%`;
    }
}