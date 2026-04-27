# Rigpa Web App

A Dzogchen learning and practice application featuring Rigpa AI chat, Dzogchen terms dictionary, Tibetan alphabet learning, and spiritual gallery.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Click **Rigpa AI** in the sidebar and enter your OpenAI API key when prompted

No `.env` file is required. Your API key is entered via the in-app modal and stored in your browser's `localStorage` — it is never committed to the repository or sent anywhere other than OpenAI.

Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

## Features

- **Rigpa AI Chat**: Interactive AI assistant for Dzogchen-related questions, powered by GPT-4o with RAG over the knowledge base
- **API Key Management**: Enter, update, or clear your OpenAI API key via the 🔑 button in the chat header — stored locally in your browser
- **Knowledge Base Manager**: Add custom texts to ground AI responses via semantic search (RAG)
- **Dzogchen Lineages**: In-depth presentations on Longchen Nyingthig, Dudjom Tersar, Namchö, Khandro Nyingthig, and Nyingthig Yabshi
- **Dzogchen Terms Dictionary**: Comprehensive glossary of Buddhist terms
- **Tibetan Alphabet Learning**: Interactive Tibetan script reference
- **Spiritual Gallery**: Collection of deity images and lineage masters
- **Rich Text Editor**: Built-in editor for notes and practice journals

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
