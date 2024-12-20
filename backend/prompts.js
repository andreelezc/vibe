module.exports = {
  functionalRequirements: `
    Generate the backlog items as specified:
    **Functional Requirements**
    - Identify functional requirements for user actions and system responses.
    - Format: FR#{i}: The system must {requirement}.
    Provide only the items without additional text.
  `,

  epics: `
    Generate the backlog items as specified:
    **Epics**
    - Identify the major features or goals.
    - Format: E#{i}: {Epic description}.
    Provide only the items without additional text.
  `,

  userStories: `
    Generate the backlog items as specified:
    **User Stories**
    - For each epic, create relevant user stories
    - Format: E#{epic number} US#{i}: As {user}, I want {feature} so that {benefit}.
    Provide only the items without additional text.
  `,

  tasks: `
    Generate the backlog items as specified:
    **Tasks**
    - For each user story, list the tasks required to implement the feature.
    - Format: E#{epic}, US#{user story}, T#{task number}: {Task}.
    Provide only the list of items in the specified order and format without additional text.
  `,
};
