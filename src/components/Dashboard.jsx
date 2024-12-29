import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, GitBranch, Database, AlertCircle } from 'lucide-react';
import PatternDetection from './PatternDetection';

const DashboardView = () => {
  const [metrics, setMetrics] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patternsRes, checkpointsRes, metricsRes] = await Promise.all([
          fetch('/api/patterns'),
          fetch('/api/checkpoints'),
          fetch('/api/metrics')
        ]);

        setPatterns(await patternsRes.json());
        setCheckpoints(await checkpointsRes.json());
        setMetrics(await metricsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Development Workflow Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Activity className="text-green-500" />
          <span>System Active</span>
        </div>
      </div>

      <Tabs defaultValue="patterns">
        <TabsList>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="detection">Pattern Detection</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map(pattern => (
                  <Alert key={pattern.id}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {pattern.name} - v{pattern.algorithm_version}
                      <div className="text-sm text-gray-500">
                        Status: {pattern.validation_status}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detection">
          <PatternDetection />
        </TabsContent>

        <TabsContent value="checkpoints">
          <Card>
            <CardHeader>
              <CardTitle>Project Checkpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={checkpoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="stateSize" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="patternReuse" stroke="#8884d8" />
                    <Line type="monotone" dataKey="contextAccuracy" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Pattern Detection</span>
                <Activity className="text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Git Integration</span>
                <GitBranch className="text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <Database className="text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;