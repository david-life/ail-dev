// pages/test.tsx
import { useState } from 'react';

// Test cases with different scenarios
const TEST_CASES = [
  { name: "Basic Test", text: "Test sentence" },
  { name: "Similar Meaning 1", text: "This is a test" },
  { name: "Similar Meaning 2", text: "Testing this out" },
  { name: "Different Topic", text: "The weather is nice today" },
  { name: "Long Text", text: "This is a much longer piece of text that should test how the embeddings handle multiple sentences with more complex meaning and structure." },
  { name: "Special Characters", text: "Test! With? Some* Special& Characters@" },
  { name: "Numbers", text: "Test 123 456 789" },
  { name: "Empty", text: "" },
  { name: "Custom Input", text: "" }, // Will be editable
];

interface EmbeddingResult {
  text: string;
  data: number[] | null;
  error?: string;
  loading: boolean;
}

export default function TestPage() {
  const [results, setResults] = useState<Record<string, EmbeddingResult>>({});
  const [customText, setCustomText] = useState('');

  const generateEmbeddings = async (text: string, name: string) => {
    // Update loading state
    setResults(prev => ({
      ...prev,
      [name]: { ...prev[name], loading: true, text }
    }));

    try {
      const response = await fetch(`/api/test-embeddings?text=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [name]: {
          text,
          data: data.data,
          loading: false,
          error: data.error
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          text,
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const runAllTests = () => {
    TEST_CASES.forEach(test => {
      const textToUse = test.name === "Custom Input" ? customText : test.text;
      if (textToUse || test.name === "Empty") {
        generateEmbeddings(textToUse, test.name);
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Embeddings Test Suite</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Enter custom text to test"
          style={{ width: '300px', marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={runAllTests}
          style={{ padding: '5px 10px' }}
        >
          Run All Tests
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {TEST_CASES.map(test => {
          const result = results[test.name];
          const textToShow = test.name === "Custom Input" ? customText : test.text;
          
          return (
            <div 
              key={test.name}
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px',
                borderRadius: '5px'
              }}
            >
              <h3>{test.name}</h3>
              <div style={{ marginBottom: '10px' }}>
                <strong>Input:</strong> {textToShow || "(empty)"}
              </div>
              
              <button
                onClick={() => generateEmbeddings(textToShow, test.name)}
                disabled={result?.loading || (test.name === "Custom Input" && !customText)}
                style={{ marginBottom: '10px' }}
              >
                {result?.loading ? 'Generating...' : 'Generate Embeddings'}
              </button>

              {result?.error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  Error: {result.error}
                </div>
              )}

              {result?.data && (
                <div>
                  <div>Vector Length: {result.data.length}</div>
                  <div>First 5 values: {result.data.slice(0, 5).join(', ')}</div>
                  <details>
                    <summary>Full Vector</summary>
                    <pre style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      fontSize: '12px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
