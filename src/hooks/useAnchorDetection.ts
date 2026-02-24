import { useState, useEffect, useCallback, useRef } from 'react';

export function useAnchorDetection(active: boolean, onViolation: () => void, onCorrection: () => void) {
  const [isMoving, setIsMoving] = useState(false);
  const baselineAccel = useRef({ x: 0, y: 0, z: 0 });
  const smoothedAccel = useRef({ x: 0, y: 0, z: 0 });
  const stillCounter = useRef(0);
  
  // Threshold for deviation from the "anchored" baseline
  const threshold = 0.55; // Slightly more sensitive
  // Number of readings to establish a new baseline (approx 1s at 60Hz)
  const stillThreshold = 60; 
  const alpha = 0.18; // Slightly faster smoothing

  // 1. Accelerometer Detection
  useEffect(() => {
    if (!active) {
      stillCounter.current = 0;
      baselineAccel.current = { x: 0, y: 0, z: 0 };
      return;
    }

    let isSubscribed = true;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isSubscribed) return;
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const rawX = accel.x || 0;
      const rawY = accel.y || 0;
      const rawZ = accel.z || 0;

      // Initialize baseline on first reading
      if (baselineAccel.current.x === 0 && baselineAccel.current.y === 0 && baselineAccel.current.z === 0) {
        baselineAccel.current = { x: rawX, y: rawY, z: rawZ };
        smoothedAccel.current = { x: rawX, y: rawY, z: rawZ };
        return;
      }

      // Smooth the current reading to filter out jitter/noise
      smoothedAccel.current = {
        x: smoothedAccel.current.x * (1 - alpha) + rawX * alpha,
        y: smoothedAccel.current.y * (1 - alpha) + rawY * alpha,
        z: smoothedAccel.current.z * (1 - alpha) + rawZ * alpha,
      };

      // Calculate deviation from the anchored baseline
      const dx = Math.abs(smoothedAccel.current.x - baselineAccel.current.x);
      const dy = Math.abs(smoothedAccel.current.y - baselineAccel.current.y);
      const dz = Math.abs(smoothedAccel.current.z - baselineAccel.current.z);

      const isDeviated = dx > threshold || dy > threshold || dz > threshold;

      if (isDeviated) {
        if (!isMoving) {
          onViolation();
          setIsMoving(true);
        }
        stillCounter.current = 0;
      } else {
        stillCounter.current += 1;
        // If we've been consistently close to the CURRENT reading, 
        // it means we are "still" in a new position (or the original one)
        if (stillCounter.current >= stillThreshold) {
          if (isMoving) {
            // Update baseline to the new still position
            baselineAccel.current = { ...smoothedAccel.current };
            onCorrection();
            setIsMoving(false);
          }
        }
      }
    };

    const startListening = async () => {
      // Handle iOS permission request if needed
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission !== 'granted') {
            console.warn('Motion permission denied');
            return;
          }
        } catch (e) {
          console.error('Error requesting motion permission', e);
          return;
        }
      }
      window.addEventListener('devicemotion', handleMotion);
    };

    startListening();

    return () => {
      isSubscribed = false;
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, onViolation]);

  // 2. Visibility / App Switching Detection
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [active, onViolation]);

  return { isMoving };
}
