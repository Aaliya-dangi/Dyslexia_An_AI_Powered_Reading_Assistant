import React, { useState, useEffect } from 'react';
import { useReadingSettings } from '../context/ReadingSettingsContext';

export default function ReadingRuler() {
  const { settings } = useReadingSettings();
  const [mouseY, setMouseY] = useState(250);

  useEffect(() => {
    if (!settings.readingRuler) return;

    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setMouseY(e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [settings.readingRuler]);

  if (!settings.readingRuler) return null;

  const height = settings.rulerHeight || 56;
  const topPos = Math.max(0, mouseY - height / 2);

  return (
    <div
      className="reading-ruler-overlay reading-ruler-beam pointer-events-none"
      style={{
        top: `${topPos}px`,
        height: `${height}px`,
      }}
      aria-hidden="true"
    />
  );
}
