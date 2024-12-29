const sessionSchema = {
    id: String,
    projectName: String,
    startTime: Date,
    endTime: Date,
    changes: [{
        type: String,
        details: Object,
        timestamp: Date
    }],
    patterns: [{
        name: String,
        success: Boolean,
        context: Object
    }],
    handoff: {
        nextSessionId: String,
        context: Object,
        timestamp: Date
    }
};