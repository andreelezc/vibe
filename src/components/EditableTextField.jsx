import React, { useState } from 'react';

const EditableTextField = ({ type, value, onSave }) => {
  const [text, setText] = useState(value);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/save-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content: text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${type}`);
      }

      console.log(`${type} saved successfully.`);
      onSave(type, text); // Update frontend state with saved content
    } catch (error) {
      console.error(`Error saving ${type}:`, error.message);
    }
  };

  return (
    <div>
      <textarea value={text} onChange={handleChange} rows="10" cols="50" />
      <button onClick={handleSaveClick}>Save</button>
    </div>
  );
};

export default EditableTextField;

