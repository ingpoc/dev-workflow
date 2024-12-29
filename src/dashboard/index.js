import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

const ProjectDashboard = () => {
    const [projectState, setProjectState] = useState({
        name: '',
        status: '',
        patterns: [],
        context: {},
        checkpoints: []
    });

    const loadProjectState = async () => {
        try {
            const state = await window.db.getProjectState();
            setProjectState(state);
        } catch (error) {
            console.error('Failed to load project state:', error);
        }
    };

    return (
        <div className="p-4">
            <Card className="mb-4">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Project Status</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Current Context</h3>
                            <pre className="bg-gray-100 p-2 rounded">
                                {JSON.stringify(projectState.context, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-semibold">Active Patterns</h3>
                            <ul className="list-disc pl-4">
                                {projectState.patterns.map(pattern => (
                                    <li key={pattern.id}>{pattern.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="mb-4">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Checkpoints</h2>
                    <div className="space-y-2">
                        {projectState.checkpoints.map(checkpoint => (
                            <Alert key={checkpoint.id}>
                                <div className="flex justify-between">
                                    <span>{checkpoint.description}</span>
                                    <span>{new Date(checkpoint.timestamp).toLocaleString()}</span>
                                </div>
                            </Alert>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProjectDashboard;