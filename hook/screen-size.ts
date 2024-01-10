import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: 9999,
    height: 9999,
  });

  useEffect(() => {
    const handleResize = () => {
      if (!window) return;
      setScreenSize({
        width: window?.innerWidth,
        height: window?.innerHeight,
      });
    };

    window?.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window?.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};

export default useScreenSize;