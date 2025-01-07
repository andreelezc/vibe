import React, { useState } from "react";
import MockupUploader from "./components/MockupUploader";
import CollapsibleArtifactList from "./components/CollapsibleArtifactList";
import ResultsViewer from "./components/ResultsViewer";
import "./App.css"; // Import the CSS file

const App = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [artifacts, setArtifacts] = useState({
    functionalRequirements: "",
    epics: "",
    userStories: "",
    tasks: "",
  });
  const [loading, setLoading] = useState(false); // Loading state

  const nextScreen = () => setCurrentScreen((prev) => prev + 1);

  const resetProcess = () => {
    setCurrentScreen(1);
    setImages([]);
    setDescription("");
    setArtifacts({
      functionalRequirements: "",
      epics: "",
      userStories: "",
      tasks: "",
    });
  };

  const handleGenerate = async (type) => {
    setLoading(true); // Start loading indicator
    const backendUrl = "http://localhost:5000"; // Backend URL

    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));
    formData.append(
      "previousArtifact",
      artifacts[
        type === "epics"
          ? "functionalRequirements"
          : type === "userStories"
          ? "epics"
          : type === "tasks"
          ? "userStories"
          : ""
      ]
    );
    formData.append("description", description);

    // Map type to kebab-case dynamically
    const endpoint = type
      .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert a hyphen between camelCase words
      .toLowerCase(); // Convert to lowercase

    try {
      console.log(`Generating ${type}...`);
      const response = await fetch(`${backendUrl}/generate-${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      // Handle plain text responses correctly
      const data = await response.text(); // Use .text() for plain text responses
      console.log(`Generated ${type}:`, data);

      // Update frontend state with the generated artifact
      setArtifacts((prev) => ({ ...prev, [type]: data }));

      // Automatically save generated artifact to the backend
      const saveResponse = await fetch(`${backendUrl}/save-artifact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content: data }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save ${type} to the backend`);
      }

      console.log(`${type} saved successfully on the backend.`);
      return data; // Return the generated artifact
    } catch (error) {
      console.error(`Error generating ${type}:`, error.message);
      return ""; // Return an empty string if the API fails
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleSave = async (type, content) => {
    try {
      const response = await fetch("http://localhost:5000/save-artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${type}`);
      }

      console.log(`${type} saved successfully.`);
      setArtifacts((prev) => ({ ...prev, [type]: content })); // Update the frontend state
    } catch (error) {
      console.error(`Error saving ${type}:`, error.message);
    }
  };

  return (
    <div className="app-container">
      {currentScreen === 1 && (
        <div className="screen">
          <h1 className="title">
            Welcome to ViBE - A Visual Backlog Extractor
          </h1>
          <p className="screen-description">
            ViBE helps you transform app mockups into actionable backlog items
            like functional requirements, epics, user stories, and tasks. Start
            by uploading your app mockups and providing a brief description of
            them.
          </p>
          <MockupUploader
            setImages={setImages}
            setDescription={setDescription}
          />
          <button
            className="button"
            disabled={images.length === 0 || description.length === 0}
            onClick={nextScreen}
          >
            Next
          </button>
        </div>
      )}

      {currentScreen === 2 && (
        <div className="screen">
          <h1 className="title">ViBE - A Visual Backlog Extractor</h1>
          <CollapsibleArtifactList
            artifacts={artifacts}
            handleGenerate={handleGenerate}
            handleSave={handleSave} // Pass the save function as a prop
            description={description}
            images={images}
            loading={loading}
          />
          <button
            className="button"
            onClick={nextScreen}
            disabled={
              loading ||
              !artifacts.functionalRequirements ||
              !artifacts.epics ||
              !artifacts.userStories ||
              !artifacts.tasks
            }
          >
            Next
          </button>
        </div>
      )}

      {currentScreen === 3 && (
        <ResultsViewer artifacts={artifacts} onReset={resetProcess} />
      )}
    </div>
  );
};

export default App;
