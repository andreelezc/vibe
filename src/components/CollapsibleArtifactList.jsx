import React, { useState } from "react";

const CollapsibleArtifactList = ({ artifacts, handleGenerate, handleSave }) => {
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
    if (type === "epics") return !artifacts.functionalRequirements;
    if (type === "userStories") return !artifacts.epics;
    if (type === "tasks") return !artifacts.epics;
    return false;
  };

  return (
    <div className="collapsible-list">
      <h2 className="step-title">
        <span className="circle-number">2</span>
        &nbsp;Generate Backlog Artifacts
      </h2>
      <p className="screen-description" style={{ textAlign: "left"}}>
        Follow the step-by-step process to generate backlog items. Start by
        generating functional requirements, then move on to epics, user stories,
        and tasks. Each step depends on the results of the previous one.
      </p>
      {Object.keys(artifacts).map((type) => (
        <div
          key={type}
          className={`artifact-item ${type
            .replace(/([A-Z])/g, "-$1")
            .toLowerCase()}`}
        >
          <div className="artifact-header">
            <span>{`${type.replace(/([A-Z])/g, " $1")}`}</span>
            {loading[type] && <div className="spinner"></div>}
            <button
              className={`header-button ${isDisabled(type) ? "disabled" : ""}`}
              onClick={() => !isDisabled(type) && generateArtifact(type)}
              disabled={isDisabled(type) || loading[type]}
            >
              Generate
            </button>
          </div>
          {expanded[type] && (
            <div className="artifact-content">
              <textarea
                value={generatedResults[type] || artifacts[type] || ""}
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
                <button
                  className="edit-button"
                  onClick={() => toggleEditable(type)}
                >
                  {isEditable[type] ? "Cancel Edit" : "Edit"}
                </button>
                <button
                  className="save-button"
                  onClick={() => {
                    if (generatedResults[type]) {
                      handleSave(type, generatedResults[type]); // Save the content
                    }
                    toggleEditable(type); // Exit edit mode
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
