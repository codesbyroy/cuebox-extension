/**
* Main Entry Point
* 
* Initializes the React application and renders the root App component.
* Sets up StrictMode for development error checking.
*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Create root and render the App component
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)