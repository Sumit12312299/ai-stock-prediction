import React, { useEffect, useRef } from 'react';

export default function SiriWaveform({ isListening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth || 380;
      canvas.height = 120;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Wave parameters
    let phase = 0;
    
    // Multiple overlapping sine waves with different parameters (amplitude, frequency, speed, colors)
    const waves = [
      { amplitude: 28, frequency: 0.015, speed: 0.08, color: 'rgba(34, 211, 238, 0.75)', lineWidth: 3 },  // Cyan
      { amplitude: 20, frequency: 0.025, speed: -0.06, color: 'rgba(52, 211, 153, 0.6)', lineWidth: 2 },   // Emerald
      { amplitude: 16, frequency: 0.012, speed: 0.12, color: 'rgba(99, 102, 241, 0.55)', lineWidth: 2 },  // Indigo
      { amplitude: 12, frequency: 0.035, speed: -0.09, color: 'rgba(167, 139, 250, 0.4)', lineWidth: 1.5 } // Violet
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.06; // Increment phase shift for movement

      // Enable screen composite blending for glowing color overlap
      ctx.globalCompositeOperation = 'screen';

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        
        // Add subtle shadow glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = wave.color;

        for (let x = 0; x < width; x++) {
          // Quadratic bell-curve envelope to taper waves at left/right edges
          const normX = x / width;
          const envelope = Math.pow(1 - Math.pow(2 * normX - 1, 2), 2);
          
          // Y position calculation combining multiple speeds/phases
          const y = centerY + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Clean shadow configurations
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening]);

  return (
    <div className="relative w-full h-[120px] flex items-center justify-center overflow-hidden my-4">
      {/* Center glowing baseline backlight */}
      <div className="absolute inset-x-10 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-md pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
