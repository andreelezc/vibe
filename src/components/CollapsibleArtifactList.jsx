import React, { useState } from 'react';

const CollapsibleArtifactList = ({ artifacts, handleGenerate }) => {
  const [expanded, setExpanded] = useState({});
  const [generatedResults, setGeneratedResults] = useState({});
  const [loading, setLoading] = useState({});
  const [isEditable, setIsEditable] = useState({});

  const toggleExpanded = (type) => {
    setExpanded((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const toggleEditable = (type) => {
    setIsEditable((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const generateArtifact = async (type) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const result = await handleGenerate(type);
      setGeneratedResults((prev) => ({ ...prev, [type]: result }));
      setExpanded((prev) => ({ ...prev, [type]: true }));
    } catch (error) {
      console.error(`Failed to generate ${type}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const isDisabled = (type) => {
    if (type === 'epics') return !artifacts.functionalRequirements;
    if (type === 'userStories') return !artifacts.epics;
    if (type === 'tasks') return !artifacts.userStories;
    return false;
  };

  return (
    <div className="collapsible-list">
      {Object.keys(artifacts).map((type) => (
        <div
          key={type}
          className={`artifact-item ${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`} // Add a static class based on type
        >
          <div className="artifact-header">
            <span>{`${type.replace(/([A-Z])/g, ' $1')}`}</span>
            {loading[type] && <div className="spinner"></div>}
            <button
              className={`header-button ${isDisabled(type) ? 'disabled' : ''}`}
              onClick={() => !isDisabled(type) && generateArtifact(type)}
              disabled={isDisabled(type) || loading[type]}
            >
              Generate
            </button>
          </div>
          {expanded[type] && (
            <div className="artifact-content">
              <textarea
                value={generatedResults[type] || artifacts[type]}
                onChange={(e) =>
                  setGeneratedResults((prev) => ({
                    ...prev,
                    [type]: e.target.value,
                  }))
                }
                rows="6"
                disabled={!isEditable[type]}
                placeholder="Generated content will appear here..."
              />
              <div className="artifact-actions">
                <button className="edit-button" onClick={() => toggleEditable(type)}>
                  {isEditable[type] ? 'Cancel Edit' : 'Edit'}
                </button>
                <button
                  className="save-button"
                  onClick={() => {
                    alert(`${type} saved successfully!`);
                    toggleEditable(type);
                  }}
                  disabled={!generatedResults[type]}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollapsibleArtifactList;
