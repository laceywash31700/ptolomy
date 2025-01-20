import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { extendTheme } from '@mui/joy'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Extend the theme with color schemes
export const customTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#007bff",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#007bff",
        },
        background: {
          default: "#121212", // dark background color
        },
      },
    },
  },
});

