import React, { useState } from 'react';

const PlainTextView = ({ artifacts }) => {
  const colors = {
    functionalRequirements: '#fff',
    epics: '#fff',
    userStories: '#fff',
    tasks: '#fff',
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

const parseArtifactsToTree = (artifacts) => {
  const tree = {};

  // Parse Epics
  artifacts.epics?.split('\n').forEach((epic) => {
    const [id, description] = epic.split(':');
    if (id && description) {
      tree[id.trim()] = { id: id.trim(), description: description.trim(), children: {} };
    }
  });

  // Parse User Stories
  artifacts.userStories?.split('\n').forEach((story) => {
    const match = story.match(/E(\d+)\sUS(\d+):\s(.*)/);
    if (match) {
      const [_, epicId, storyId, description] = match;
      const epicKey = `E${epicId}`;
      const storyKey = `US${storyId}`;
      if (tree[epicKey]) {
        tree[epicKey].children[storyKey] = { id: storyKey, description: description.trim(), children: {} };
      }
    }
  });

  // Parse Tasks
  artifacts.tasks?.split('\n').forEach((task) => {
    const match = task.match(/E(\d+),\sUS(\d+),\sT(\d+):\s(.*)/);
    if (match) {
      const [_, epicId, storyId, taskId, description] = match;
      const epicKey = `E${epicId}`;
      const storyKey = `US${storyId}`;
      const taskKey = `T${taskId}`;
      if (tree[epicKey]?.children[storyKey]) {
        tree[epicKey].children[storyKey].children[taskKey] = { id: taskKey, description: description.trim() };
      }
    }
  });

  return tree;
};

const RenderTree = ({ node }) => {
  if (!node) return null;

  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
      {Object.entries(node).map(([key, value]) => (
        <TreeNode key={key} node={value} />
      ))}
    </ul>
  );
};

const TreeNode = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <li style={{ marginBottom: '10px' }}>
      <div>
        {node.children ? (
          <button
            onClick={toggleExpand}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#007bff',
              textDecoration: 'underline',
              marginRight: '5px',
            }}
          >
            {isExpanded ? '[-]' : '[+]'}
          </button>
        ) : (
          '•'
        )}
        <strong>{node.id}:</strong> {node.description}
      </div>
      {isExpanded && node.children && <RenderTree node={node.children} />}
    </li>
  );
};

const JSONTreeView = ({ artifacts }) => {
  const tree = parseArtifactsToTree(artifacts);

  return (
    <div className="json-tree-view">
      <RenderTree node={tree} />
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
    const tree = parseArtifactsToTree(artifacts); // Convert artifacts to tree structure
    content = JSON.stringify(tree, null, 2); // Export tree structure
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


