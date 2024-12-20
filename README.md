# ViBE (Visual Backlog Extractor) 🚀

ViBE is a lightweight tool designed to assist in backlog creation by analyzing app mockups and automatically generating actionable backlog items such as **functional requirements**, **epics**, **user stories**, and **tasks**. 

## Key Features
- **Upload App Mockups**: Easily upload multiple app screenshots or designs.
- **AI-Powered Backlog Generation**: Automatically generates detailed backlog items, including:
  - Functional Requirements
  - Epics
  - User Stories
  - Tasks
- **Step-by-Step Workflow**: Generates backlog items sequentially, where each artifact depends on the previous one.
- **Editable Artifacts**: Manually refine generated items before saving.
- **Export Options**: Export results in text or JSON formats.

---

## Screenshots

### Upload Mockups
* Upload Mockups Screen

### Generate Backlog Artifacts
* Generate Backlog Artifacts Screen

### Results Viewer
* Results Viewer Screen

---

### Prerequisites
- **Node.js** (v16+)
- **npm** (v8+)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the root with your OpenAI API key:
   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run at `http://localhost:5000`.

### Frontend Setup
1. Navigate to the root folder:
   ```bash
   cd vibe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend will run at `http://localhost:3000`.

---

## Usage

### Step 1: Upload Mockups
- Upload app mockups and provide a brief project description.

### Step 2: Generate Backlog Artifacts
- Follow the step-by-step workflow to generate:
  1. Functional Requirements
  2. Epics
  3. User Stories
  4. Tasks

### Step 3: Review and Export
- View generated results in either plain text or a JSON tree structure.
- Edit and save artifacts as needed.
- Export the backlog as a `.txt` or `.json` file.

---

## Project Structure
```
project/
│
├── backend/                  # Backend code (Node.js)
│   ├── server.js             # Express server logic
│   ├── prompts.js            # Prompts for backlog generation
│   └── package.json          # Backend dependencies
│
├── public/                   # Static frontend assets
│   ├── index.html            # Main HTML file
│
├── src/                      # Frontend React code
│   ├── App.js                # Main application logic
│   ├── components/           # React components (e.g., MockupUploader, ResultsViewer)
│   ├── App.css               # Styling for the application
│   └── index.js              # React entry point
│
├── .env                      # API key configuration
├── package.json              # Frontend dependencies
└── README.md                 # Project documentation
```
---

## Contributing

We welcome contributions to improve ViBE! If you'd like to contribute:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes and push them:
   ```bash
   git push origin feature/your-feature
   ```
4. Create a Pull Request on GitHub.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Acknowledgements


---
