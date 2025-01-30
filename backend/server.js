const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For resizing images
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
const processImages = async (files) => {
  try {
    return await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(__dirname, file.path);
        console.log('Processing file:', filePath, 'MIME Type:', file.mimetype);

        // Convert to JPEG format
        const processedBuffer = await sharp(filePath)
          .toFormat('jpeg') // Convert all images to JPEG
          .resize({ width: 500 }) // Resize for optimization
          .jpeg({ quality: 80 }) // Adjust quality
          .toBuffer();

        const base64String = processedBuffer.toString('base64');

        console.log('Processed Image (Base64) Preview:', base64String.slice(0, 100)); // Debug first 100 chars

        return {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64String}` } // Properly formatted Base64 URL
        };
      })
    );
  } catch (error) {
    console.error('Error processing images:', error.message);
    throw error;
  }
};

// Helper to call OpenAI API
const callLLMAPI = async (messages) => {
  try {
    console.log('Payload sent to LLM API:', JSON.stringify(messages, null, 2));
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
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
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
    throw error;
  }
};

// Helper to parse JSON responses (for Scene Graphs and Personas)
const parseJSONResponse = (response) => {
  try {
    const cleanJSON = response.replace(/```(?:json)?/g, '').trim(); // Clean markdown syntax
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error('Error parsing JSON:', error.message);
    console.log('Raw response for debugging:', response);
    throw new Error('Invalid JSON response from API');
  }
};

// Helper to generate Personas (JSON Response)
const generatePersonas = async (files) => {
  const images = await processImages(files); // Process all uploaded images


  const messages = [
    {
      role: 'system',
      content: prompts.systemPrompt,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: prompts.personaPrompt },
        ...images  // Corrected to send `image_url`
      ],
    },
  ];

  const result = await callLLMAPI(messages);
  console.log('Generated Personas:', result); // Log raw response
  return parseJSONResponse(result); // Parse and return JSON
};

// Helper to generate Scene Graphs (JSON Response)
const generateSceneGraph = async (files) => {
  const images = await processImages(files); // Process all uploaded images

  const messages = [
    {
      role: 'system',
      content: prompts.systemPrompt,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: prompts.ccotSceneGraphPrompt },
        ...images  // Corrected to send `image_url`
      ],
    },
  ];

  const result = await callLLMAPI(messages);
  console.log('Generated Scene Graph:', result); // Log raw response
  return parseJSONResponse(result); // Parse and return JSON
};

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Directory created: ${directory}`);
  }
};

// Update `saveGeneratedArtifact` to use this helper
const saveGeneratedArtifact = (type, content) => {
  const directory = './savedArtifacts';
  ensureDirectoryExists(directory); // Ensure the directory exists

  const filePath = `${directory}/${type}.txt`;
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${type} saved successfully.`);
  } catch (error) {
    console.error(`Error saving ${type}:`, error.message);
  }
};


// Load the latest saved artifact from the filesystem
const loadSavedArtifact = (type) => {
  const filePath = `./savedArtifacts/${type}.txt`;
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    console.error(`Artifact of type ${type} not found.`);
    return null;
  }
};

// Endpoint to generate Functional Requirements (Plain Text)
app.post('/generate-functional-requirements', upload.array('images'), async (req, res) => {
  console.log('Starting Functional Requirements Generation...');
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images were uploaded.' });
  }

  // Validate supported formats
  const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  const invalidFiles = files.filter((file) => !supportedFormats.includes(file.mimetype));
  if (invalidFiles.length > 0) {
    console.error('Unsupported image format:', invalidFiles.map((file) => file.originalname));
    return res.status(400).json({
      error: 'One or more uploaded files have an unsupported format. Supported formats are png, jpeg, gif, and webp.',
    });
  }

  try {
    console.log('Step 1: Processing Images...');
    const images = await processImages(files);
    console.log(`Processed ${images.length} images successfully.`);

    console.log('Step 2: Generating Personas...');
    const personas = await generatePersonas(files);
    console.log('Generated Personas:', JSON.stringify(personas, null, 2));

    // Save Personas to backend
    saveGeneratedArtifact('personas', JSON.stringify(personas, null, 2));

    console.log('Step 3: Preparing Messages...');
    const messages = [
      {
        role: 'system',
        content: prompts.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompts.personaFRPrompt },
          ...images,
        ],
      },
      {
        role: 'assistant',
        content: `Personas: ${JSON.stringify(personas)}`,
      },
    ];
    console.log('Prepared Messages:', JSON.stringify(messages, null, 2));

    console.log('Step 4: Calling LLM API...');
    const results = await callLLMAPI(messages);
    console.log('LLM API Response:', results);

    // Save the generated Functional Requirements
    saveGeneratedArtifact('functionalRequirements', results);

    console.log('Step 5: Cleaning Up...');
    files.forEach((file) => fs.unlinkSync(file.path));

    console.log('Step 6: Sending Response...');
    res.send(results);
  } catch (error) {
    console.error('Error generating Functional Requirements:', error.message);
    res.status(500).send('Failed to generate Functional Requirements');
  }
});


// Endpoint to generate Epics (Plain Text)
app.post('/generate-epics', upload.array('images'), async (req, res) => {
  console.log('Starting Epics Generation...');
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images were uploaded.' });
  }

  // Validate supported formats
  const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  const invalidFiles = files.filter((file) => !supportedFormats.includes(file.mimetype));
  if (invalidFiles.length > 0) {
    console.error('Unsupported image format:', invalidFiles.map((file) => file.originalname));
    return res.status(400).json({
      error: 'One or more uploaded files have an unsupported format. Supported formats are png, jpeg, gif, and webp.',
    });
  }

  try {
    console.log('Step 1: Processing Images...');
    const images = await processImages(files);
    console.log(`Processed ${images.length} images successfully.`);

    console.log('Step 2: Generating Scene Graph...');
    const sceneGraph = await generateSceneGraph(files);
    console.log('Generated Scene Graph:', JSON.stringify(sceneGraph, null, 2));

    // Save Scene Graph to backend
    saveGeneratedArtifact('sceneGraph', JSON.stringify(sceneGraph, null, 2));

    console.log('Step 3: Preparing Messages...');
    const messages = [
      {
        role: 'system',
        content: prompts.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompts.ccotEpicsPrompt },
          ...images,
        ],
      },
      {
        role: 'assistant',
        content: `Scene Graph: ${JSON.stringify(sceneGraph)}`,
      },
    ];
    console.log('Prepared Messages:', JSON.stringify(messages, null, 2));

    console.log('Step 4: Calling LLM API...');
    const results = await callLLMAPI(messages);
    console.log('LLM API Response:', results);

    // Save the generated Epics
    saveGeneratedArtifact('epics', results);

    console.log('Step 5: Cleaning Up...');
    files.forEach((file) => fs.unlinkSync(file.path));

    console.log('Step 6: Sending Response...');
    res.send(results);
  } catch (error) {
    console.error('Error generating Epics:', error.message);
    res.status(500).send('Failed to generate Epics');
  }
});


// Endpoint to generate User Stories
app.post('/generate-user-stories', upload.array('images'), async (req, res) => {
  console.log('Starting User Stories Generation...');
  const files = req.files;
  const epics = loadSavedArtifact('epics');
  const sceneGraph = loadSavedArtifact('sceneGraph');

  if (!epics || !sceneGraph) {
    return res.status(400).json({ error: 'Missing required artifacts: Epics or Scene Graph.' });
  }

  // Validate supported formats
  const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  const invalidFiles = files.filter((file) => !supportedFormats.includes(file.mimetype));
  if (invalidFiles.length > 0) {
    console.error('Unsupported image format:', invalidFiles.map((file) => file.originalname));
    return res.status(400).json({
      error: 'One or more uploaded files have an unsupported format. Supported formats are png, jpeg, gif, and webp.',
    });
  }

  try {
    console.log('Step 1: Processing Images...');
    const images = await processImages(files);
    console.log(`Processed ${images.length} images successfully.`);

    console.log('Step 2: Preparing Messages...');
    const messages = [
      {
        role: 'system',
        content: prompts.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompts.ccotUserStoriesPrompt },
          ...images,
        ],
      },
      {
        role: 'assistant',
        content: `Scene Graph: ${sceneGraph}`, // Use provided Scene Graph
      },
      {
        role: 'assistant',
        content: `Epics: ${epics}`, // Use provided Epics
      },
    ];
    console.log('Prepared Messages:', JSON.stringify(messages, null, 2));

    console.log('Step 3: Calling LLM API...');
    const results = await callLLMAPI(messages);
    console.log('LLM API Response:', results);

    // Automatically save the generated User Stories
    saveGeneratedArtifact('userStories', results);

    console.log('Step 4: Cleaning Up...');
    files.forEach((file) => fs.unlinkSync(file.path)); // Remove uploaded files

    console.log('Step 5: Sending Response...');
    res.send(results);
  } catch (error) {
    console.error('Error generating User Stories:', error.message);
    res.status(500).json({ error: 'Failed to generate User Stories' });
  }
});


// Endpoint to generate Tasks (Plain Text, with Architectural Context)
app.post('/generate-tasks', upload.array('images'), async (req, res) => {
  console.log('Starting Tasks Generation...');
  const files = req.files;
  const userStories = loadSavedArtifact('userStories');
  const sceneGraph = loadSavedArtifact('sceneGraph');
  const description = req.body.description || "No description provided."; // ✅ Retrieve architectural context

  if (!userStories || !sceneGraph) {
    return res.status(400).json({ error: 'Missing required artifacts: User Stories or Scene Graph.' });
  }

  if (!description) {
    console.warn("No description provided.");
  }

  // Validate supported formats
  const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  const invalidFiles = files.filter((file) => !supportedFormats.includes(file.mimetype));
  if (invalidFiles.length > 0) {
    console.error('Unsupported image format:', invalidFiles.map((file) => file.originalname));
    return res.status(400).json({
      error: 'One or more uploaded files have an unsupported format. Supported formats are png, jpeg, gif, and webp.',
    });
  }

  try {
    console.log('Step 1: Processing Images...');
    const images = await processImages(files);
    console.log(`Processed ${images.length} images successfully.`);

    console.log('Step 2: Formatting Task Prompt with Architectural Context...');
    const formattedTasksPrompt = `The following is the architectural context for this project:\n${description}\n\n${prompts.ccotTasksPrompt}`;
    console.log("Formatted Tasks Prompt:", formattedTasksPrompt);

    console.log('Step 3: Preparing Messages...');
    const messages = [
      {
        role: 'system',
        content: prompts.systemPrompt,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: formattedTasksPrompt },
          ...images,
        ],
      },
      {
        role: 'assistant',
        content: `Scene Graph: ${sceneGraph}`,
      },
      {
        role: 'assistant',
        content: `User Stories: ${userStories}`,
      },
    ];
    console.log('Prepared Messages:', JSON.stringify(messages, null, 2));

    console.log('Step 4: Calling LLM API...');
    const results = await callLLMAPI(messages);
    console.log('LLM API Response:', results);

    saveGeneratedArtifact('tasks', results);

    console.log('Step 5: Cleaning Up...');
    files.forEach((file) => fs.unlinkSync(file.path));

    console.log('Step 6: Sending Response...');
    res.send(results);

  } catch (error) {
    console.error('Error generating Tasks:', error.message);
    res.status(500).send('Failed to generate Tasks');
  }
});

// Test endpoint
app.get('/test-api', async (req, res) => {
  try {
    const messages = [
      { role: 'system', content: 'You are an assistant.' },
      { role: 'user', content: 'Hello, can you provide a summary?' },
    ];
    const response = await callLLMAPI(messages);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'API Test Failed', details: error.message });
  }
});

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
