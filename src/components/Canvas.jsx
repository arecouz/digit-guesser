import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Canvas = ({ setImageData }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 300;

  useEffect(() => {
    // Set the canvas and its context, use ref's to access
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const context = canvas.getContext('2d');
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    context.lineCap = 'round';
    contextRef.current = context;
  }, []);

  // Discards RGB to return list of black or white pixels
  const extractAlpha = (imageData) => {
    console.log(imageData)
    return imageData.data.filter((_, index) => (index + 1) % 4 === 0);
  }

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // Sets Image data when the user stops drawing a line
  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    const blackAndWhite = extractAlpha(contextRef.current.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT))
    setImageData(blackAndWhite);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    // For mouse events, use offsetX, offsetY
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // Touch event handlers
  const startDrawingTouch = (e) => {
    // Get touch position from e.touches[0]
    const { clientX, clientY } = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const drawTouch = (e) => {
    if (!isDrawing) return;

    const { clientX, clientY } = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  return (
    <canvas
      className='border-8'
      ref={canvasRef}
      // Desktop
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={draw}
      // Mobile
      onTouchStart={startDrawingTouch}
      onTouchMove={drawTouch}
      onTouchEnd={stopDrawing}
      onTouchCancel={stopDrawing}
    ></canvas>
  );
};

Canvas.propTypes = {
  setImageData: PropTypes.func.isRequired,
};

export default Canvas;
