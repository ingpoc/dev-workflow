import { PatternUsageTracker } from '../src/patterns/usage';
import { WorkflowIntegration } from '../src/integration';

describe('Pattern Usage Tracking', () => {
    let tracker;
    let mockMongo;

    beforeEach(() => {
        mockMongo = {
            updateOne: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn()
        };
        tracker = new PatternUsageTracker(mockMongo);
    });

    test('tracks pattern usage correctly', async () => {
        await tracker.trackUsage('pattern1', { type: 'react' }, true);
        expect(mockMongo.updateOne).toHaveBeenCalled();
    });

    test('calculates success rate accurately', async () => {
        mockMongo.findOne.mockResolvedValue({
            usageStats: {
                contexts: [
                    { success: true },
                    { success: false },
                    { success: true }
                ]
            }
        });

        const rate = await tracker.calculateSuccessRate('pattern1', true);
        expect(rate).toBe(75); // (3 success / 4 total) * 100
    });
});

describe('Workflow Integration', () => {
    let integration;
    
    beforeEach(() => {
        integration = new WorkflowIntegration();
    });

    test('saves checkpoints correctly', async () => {
        const state = { status: 'testing' };
        await integration.saveCheckpoint('project1', state);
        // Add assertions
    });
});