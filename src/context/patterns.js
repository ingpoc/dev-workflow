class PatternManager {
    async savePattern(pattern) {
        try {
            await this.updateMongoDB('patterns', {
                name: pattern.name,
                category: pattern.category,
                implementation: pattern.implementation,
                metadata: {
                    usageCount: 0,
                    lastUsed: new Date(),
                    successRate: 100
                }
            });
        } catch (error) {
            console.error('Pattern save failed:', error);
        }
    }

    async getPattern(category, context) {
        try {
            const patterns = await this.queryMongoDB('patterns', {
                category,
                'metadata.successRate': { $gt: 80 }
            });
            return this.rankPatterns(patterns, context);
        } catch (error) {
            console.error('Pattern fetch failed:', error);
            return null;
        }
    }

    rankPatterns(patterns, context) {
        return patterns.sort((a, b) => {
            const scoreA = this.calculateScore(a, context);
            const scoreB = this.calculateScore(b, context);
            return scoreB - scoreA;
        })[0];
    }

    calculateScore(pattern, context) {
        const usageScore = pattern.metadata.usageCount * 0.3;
        const successScore = pattern.metadata.successRate * 0.5;
        const contextScore = this.matchContext(pattern, context) * 0.2;
        return usageScore + successScore + contextScore;
    }

    matchContext(pattern, context) {
        // Context matching logic
        const matchingKeys = Object.keys(pattern.context || {})
            .filter(key => pattern.context[key] === context[key]);
        return (matchingKeys.length / Object.keys(context).length) * 100;
    }
}