import React, { useState } from 'react';

const EditableTextField = ({ type, value, onSave }) => {
  const [text, setText] = useState(value);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSaveClick = () => {
    onSave(type, text);
  };

  return (
    <div>
      <textarea value={text} onChange={handleChange} rows="10" cols="50" />
      <button onClick={handleSaveClick}>Save</button>
    </div>
  );
};

export default EditableTextField;
