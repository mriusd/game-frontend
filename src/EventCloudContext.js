import { createContext, useContext, useState, useEffect } from 'react';
import { useDebounce } from './hooks/useDebounce';

const EventCloudContext = createContext({
  events: [],
  addDamageEvent: () => {},
  setEvents: () => {},
});


export const useEventCloud = () => {
  return useContext(EventCloudContext);
};

export const EventCloudProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [latestDamageEvent, setLatestDamageEvent] = useState(null);

  const debouncedLatestDamageEvent = useDebounce(latestDamageEvent, 50);

  // Add any event processing logic here

  useEffect(() => {
    // Listen for events from your backend server and update the events state
  }, []);

  const addDamageEvent = (damageEvent) => {
    setEvents((prevEvents) => [...prevEvents, { type: 'damage', ...damageEvent }]);
    setLatestDamageEvent({ type: 'damage', ...damageEvent });
  };

  return (
    <EventCloudContext.Provider value={{ events, addDamageEvent, setEvents }}>
      {children}
    </EventCloudContext.Provider>
  );
};

