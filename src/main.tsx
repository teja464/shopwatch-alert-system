
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable long-press for context menus on mobile
document.addEventListener('touchstart', function() {}, { passive: true });

createRoot(document.getElementById("root")!).render(<App />);
