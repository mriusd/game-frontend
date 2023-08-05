import './index.scss';

import { createRoot } from 'react-dom/client';
import { EventCloudProvider } from './store/EventCloudContext';

import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <EventCloudProvider>
    <App />
  </EventCloudProvider>
);