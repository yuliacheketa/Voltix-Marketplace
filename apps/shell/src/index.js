import React from 'react';
import { createRoot } from 'react-dom/client';


const App = () => (
  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f4f4f4', height: '100vh' }}>
    <h1>Voltix Marketplace</h1>
    <p>Shell</p>
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);