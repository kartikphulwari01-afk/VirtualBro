import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AudioProvider } from './context/AudioContext'
import { ZoroProvider } from './context/ZoroContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <ZoroProvider>
        <App />
      </ZoroProvider>
    </AudioProvider>
  </React.StrictMode>,
)
