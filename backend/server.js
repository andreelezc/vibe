const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

const cors = require('cors');
app.use(cors());


// Middleware
const upload = multer({ dest: 'uploads/' });
app.use(express.json());

// Import prompts
const prompts = require('./prompts');

// Helper to process images
const processImages = (files) => {
  return files.map((file) => {
    const filePath = path.join(__dirname, file.path);
    const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:image/png;base64,${fileData}`;
  });
};

// Helper to call the LLM API
const callLLMAPI = async (messages) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM API:', error.message);
    throw error;
  }
};

// Dynamic endpoint generator
const createEndpoint = (artifactType, prompt) => {
  app.post(`/generate-${artifactType}`, upload.array('images', 4), async (req, res) => {
    const files = req.files;
    const previousArtifact = req.body.previousArtifact || ''; // Optional input

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images were uploaded.' });
    }

    try {
      const images = processImages(files);
      const messages = [
        {
          role: 'system',
          content:
            'You are an experienced requirements engineer specializing in translating app mockups into detailed backlog items.',
        },
        {
          role: 'user',
          content: JSON.stringify([
            { type: 'text', text: previousArtifact },
            { type: 'text', text: prompt },
            ...images.map((image) => ({
              type: 'image_base64',
              image_base64: { data: image },
            })),
          ]),
        },
      ];

      const results = await callLLMAPI(messages);

      files.forEach((file) => fs.unlinkSync(file.path)); // Clean up

      res.json(results);
    } catch (error) {
      console.error(`Error generating ${artifactType}:`, error.message);
      res.status(500).send(`Failed to generate ${artifactType}`);
    }
  });
};

// Define endpoints for each artifact
createEndpoint('functional-requirements', prompts.functionalRequirements);
createEndpoint('epics', prompts.epics);
createEndpoint('user-stories', prompts.userStories);
createEndpoint('tasks', prompts.tasks);

// Save edited artifact
app.post('/save-artifact', async (req, res) => {
  const { type, content } = req.body;
  const filePath = `./savedArtifacts/${type}.txt`;

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    res.status(200).json({ message: `${type} saved successfully` });
  } catch (error) {
    console.error('Error saving artifact:', error.message);
    res.status(500).send('Failed to save artifact');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
