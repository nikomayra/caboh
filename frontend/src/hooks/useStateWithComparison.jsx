import { useState, useRef } from 'react';

const useStateWithComparison = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const prevStateRef = useRef(initialValue);

  const setStateWithComparison = (newValue) => {
    if (prevStateRef.current !== newValue) {
      prevStateRef.current = newValue;
      setState(newValue);
    }
  };

  return [state, setStateWithComparison];
};

export default useStateWithComparison;
