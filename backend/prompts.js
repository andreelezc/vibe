module.exports = {
  // System Prompt
  systemPrompt: `
  You are an experienced requirements engineer specializing in translating app mockups into detailed backlog items. Your 
  focus is on understanding user needs and providing clear, actionable items for development teams.
  `,
  // Persona Prompt
  personaPrompt: `
    Consider the following group of mockups from an app. Identify the potential user personas and roles using the provided 
    JSON template:

    {
      "Persona #1": {
        "who": {
          "name": "",
          "demographics": {
            "age": 0,
            "gender": "",
            "organization": "",
            "location": ""
          },
          "role": ""
        },
        "what": {
          "requirement": ""
        },
        "why": {
          "motivation": ""
        },
        "storytelling": {
          "story": ""
        }
      }
    }

    Provide only the JSON structure with no additional text.
  `,

  // Functional Requirements with Persona Prompt
  personaFRPrompt: `
    Analyze the following group of mockups from an app and its accompanying user personas and generate the backlog items as 
    specified in plain text:

    **Functional Requirements**
    - Identify functional requirements for user actions and system responses.
    - Format: FR{i}: The system must {requirement}.

    Provide only the items without additional text.
  `,

  // Scene Graph Prompt for CCOT
  ccotSceneGraphPrompt: `
    Generate a scene graph for this group of mockups by identifying the objects (UI components) and their relationships. 
    Summarize repeated elements and only provide unique attributes for each occurrence. Provide the output as a structured 
    JSON object in the exact format shown below:

    {
      "sceneGraph": {
        "objects": [],
        "relationships": {
          "ComponentType1": "relationship description"
        }
      }
    }

    Do not include any additional text or explanations outside the JSON object.
  `,

  // Epics Prompt for CCOT
  ccotEpicsPrompt: `
    Analyze the following group of mockups from an app and its accompanying scene graph and generate the backlog items as 
    specified in plain text:

    **Epics**
    - Identify the major features or goals.
    - Format: E{i}: {Epic description}.

    Provide only the specified items without additional text.
  `,

  // User Stories Prompt for CCOT
  ccotUserStoriesPrompt: `
    Analyze the following group of mockups from an app and its accompanying scene graph and generate the backlog items as 
    specified in plain text:

    **User Stories**
    - For each epic, create relevant user stories.
    - Format: E{epic number} US{i}: As {user}, I want {feature} so that {benefit}.

    Provide only the specified items without additional text.
  `,

  // Tasks Prompt for CCOT
  ccotTasksPrompt: `
    Analyze the following group of mockups from an app and its accompanying scene graph and generate the backlog items as 
    specified in plain text:

    **Tasks**
    - For each user story, list the tasks required to implement the feature.
    - Format: E{epic number}, US{user story number}, T{task number}: {Task}.

    Provide only the specified items without additional text.
  `
};
