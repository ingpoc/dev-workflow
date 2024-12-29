import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Search, Code } from 'lucide-react';

const PatternDetection = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pattern-detection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode })
      });
      const data = await response.json();
      setPatterns(data.patterns);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste your code here..."
              className="h-64 font-mono"
            />
            <Button 
              onClick={analyzeCode} 
              disabled={loading || !sourceCode}
              className="w-full"
            >
              {loading ? (
                'Analyzing...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Detect Patterns
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <Alert key={index} className={pattern.confidence > 0.8 ? 'bg-green-50' : 'bg-yellow-50'}>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pattern.type}</span>
                      <span className="text-sm">
                        Confidence: {(pattern.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      Line {pattern.location?.start?.line || 'unknown'}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    Consider {pattern.confidence < 0.8 ? 'reviewing' : 'documenting'} the {pattern.type} pattern implementation
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatternDetection;