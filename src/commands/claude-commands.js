class ClaudeCommandProcessor {
    constructor(store, templates) {
        this.store = store;
        this.templates = templates;
    }

    async loadProject(name) {
        const context = await this.store.loadProjectContext(name);
        return this.templates.contextPreservation.stateLoad
            .replace("{projectName}", name)
            .replace("{checkpoint}", context.state.lastCheckpoint);
    }

    async applyPattern(name, context) {
        const pattern = await this.store.findPattern(name);
        return {
            prompt: this.templates.contextPreservation.patternApplication
                .replace("{patternName}", name)
                .replace("{context}", JSON.stringify(context)),
            implementation: pattern.implementation
        };
    }

    async createProjectHandoff(name) {
        const context = await this.store.loadProjectContext(name);
        return this.templates.contextPreservation.stateHandoff
            .replace("{projectName}", name)
            .replace("{state}", JSON.stringify(context.state));
    }
}