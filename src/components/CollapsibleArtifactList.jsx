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
      console.log(`Generating ${type}...`);
      const result = await handleGenerate(type); // Fetch plain text
      console.log(`Generated ${type}:`, result);
      setGeneratedResults((prev) => ({ ...prev, [type]: result })); // Store the result
      setExpanded((prev) => ({ ...prev, [type]: true })); // Expand the section
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

  const saveArtifact = async (type, content) => {
  try {
    const response = await fetch('http://localhost:5000/save-artifact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${type}`);
    }

    console.log(`${type} saved successfully.`);
    setGeneratedResults((prev) => ({ ...prev, [type]: content })); // Update frontend state
  } catch (error) {
    console.error(`Error saving ${type}:`, error.message);
  }
};


  return (
    <div className="collapsible-list">
      {Object.keys(artifacts).map((type) => (
        <div
          key={type}
          className={`artifact-item ${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
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
                value={generatedResults[type] || artifacts[type] || ''}
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
                      saveArtifact(type, generatedResults[type]); // Save the edited content
                      toggleEditable(type); // Disable edit mode
                    }}
                    disabled={!generatedResults[type]} // Disable Save if no content
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
