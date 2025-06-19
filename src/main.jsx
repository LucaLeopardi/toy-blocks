import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import { SceneProvider } from './scene-context.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
	<SceneProvider>
		<App />
	</SceneProvider>
  </React.StrictMode>,
)
