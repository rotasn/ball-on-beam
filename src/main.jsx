import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Ballbeam from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Ballbeam />
  </StrictMode>,
)
