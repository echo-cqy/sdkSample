import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TrackerProvider } from 'sdk-sample'
import { initMockAdapter } from './mock/mock-adapter'

// Initialize Mock Adapter to intercept requests
initMockAdapter();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TrackerProvider config={{ 
      endpoint: '/api/track', 
      autoTrack: true,
      debug: true // Set to false to test Safe Mode (suppressed errors)
    }}>
      <App />
    </TrackerProvider>
  </React.StrictMode>,
)
