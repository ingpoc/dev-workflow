class PatternUsageTracker {
    constructor(mongo) {
        this.mongo = mongo;
    }

    async trackUsage(patternId, context, success) {
        const usage = {
            timestamp: new Date(),
            context,
            success
        };

        await this.mongo.updateOne('patterns', 
            { _id: patternId },
            { 
                $inc: { 'usageStats.count': 1 },
                $push: { 'usageStats.contexts': usage },
                $set: { 
                    'usageStats.successRate': await this.calculateSuccessRate(patternId, success)
                }
            }
        );
    }

    async calculateSuccessRate(patternId, newSuccess) {
        const pattern = await this.mongo.findOne('patterns', { _id: patternId });
        const contexts = pattern.usageStats.contexts || [];
        const successCount = contexts.filter(c => c.success).length + (newSuccess ? 1 : 0);
        return (successCount / (contexts.length + 1)) * 100;
    }

    async getRecommendation(category, context) {
        const patterns = await this.mongo.find('patterns', { category });
        return patterns.sort((a, b) => 
            (b.usageStats.successRate * 0.7 + b.usageStats.count * 0.3) -
            (a.usageStats.successRate * 0.7 + a.usageStats.count * 0.3)
        )[0];
    }
}