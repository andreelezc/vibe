import React, { useState } from 'react';

const MockupUploader = ({ setImages, setDescription }) => {
  const [thumbnails, setThumbnails] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    console.log('Selected Files:', files); // Log selected files
    setImages(files);

    // Generate thumbnail URLs
    const newThumbnails = files.map((file) => URL.createObjectURL(file));
    setThumbnails(newThumbnails);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  return (
    <div className="mockup-uploader">
      <h2>Upload Your Mockups</h2>
      <div className="thumbnail-preview">
        {thumbnails.map((thumbnail, index) => (
          <img
            key={index}
            src={thumbnail}
            alt={`Uploaded Mockup ${index + 1}`}
            className="thumbnail"
          />
        ))}
      </div>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <textarea
        placeholder="Enter a brief description of the project"
        onChange={handleDescriptionChange}
        rows="4"
        cols="50"
      />
    </div>
  );
};

export default MockupUploader;
