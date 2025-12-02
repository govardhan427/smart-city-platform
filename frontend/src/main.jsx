import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Import BrowserRouter
import App from './App'

// --- ADD THIS LINE ---
import './assets/styles/main.css' 
// ---------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap our App in the router so all pages can use it */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)