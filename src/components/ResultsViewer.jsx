import React, { useState } from 'react';

const PlainTextView = ({ artifacts }) => {
  const colors = {
    functionalRequirements: '#F9DDF0',
    epics: '#FEC6B7',
    userStories: '#D8DCFF',
    tasks: '#FFE7CB',
  };

  return (
    <div className="plain-text-view">
      {Object.entries(artifacts).map(([type, content]) => (
        <div key={type} className="artifact-card" style={{ backgroundColor: colors[type] || '#ffffff' }}>
          <h3 className="artifact-title">{type.replace(/([A-Z])/g, ' $1')}</h3>
          <pre className="artifact-content">{content || 'No data available.'}</pre>
        </div>
      ))}
    </div>
  );
};

const JSONTreeView = ({ artifacts }) => {
  return (
    <div className="json-tree-view">
      <h3>JSON Tree View</h3>
      <pre className="json-content">{JSON.stringify(artifacts, null, 2)}</pre>
    </div>
  );
};

const exportResults = (artifacts, format) => {
  let content = '';
  let fileName = '';

  if (format === 'text') {
    content = Object.entries(artifacts)
      .map(([type, data]) => `${type.toUpperCase()}:\n${data}\n`)
      .join('\n');
    fileName = 'results.txt';
  } else if (format === 'json') {
    content = JSON.stringify(artifacts, null, 2);
    fileName = 'results.json';
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const ResultsViewer = ({ artifacts, onReset }) => {
  const [viewMode, setViewMode] = useState('text'); // 'text' or 'tree'

  return (
    <div className="results-viewer">
      <h1 className="results-title">Results Viewer</h1>
      <div className="button-container">
        <button className="toggle-button" onClick={() => setViewMode(viewMode === 'text' ? 'tree' : 'text')}>
          Toggle to {viewMode === 'text' ? 'Tree View' : 'Text View'}
        </button>
      </div>

      {viewMode === 'text' ? (
        <PlainTextView artifacts={artifacts} />
      ) : (
        <JSONTreeView artifacts={artifacts} />
      )}

      <div className="export-container">
        <button className="export-button export-text" onClick={() => exportResults(artifacts, 'text')}>
          Export as Text
        </button>
        <button className="export-button export-json" onClick={() => exportResults(artifacts, 'json')}>
          Export as JSON
        </button>
        <button className="export-button reset-button" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsViewer;


