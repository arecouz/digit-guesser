import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Canvas = ({ setImageData }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const CANVAS_WIDTH = 280;
  const CANVAS_HEIGHT = 280;
  const TARGET_WIDTH = 28;
  const TARGET_HEIGHT = 28;

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

  const compressImageData = (imageData) => {
    // Create temporary canvases for resizing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');

    // Set canvas sizes
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    finalCanvas.width = TARGET_WIDTH;
    finalCanvas.height = TARGET_HEIGHT;

    // Put the original imageData into the temp canvas
    tempCtx.putImageData(imageData, 0, 0);

    // Draw the temp canvas onto the final canvas at the smaller size
    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0,
      0,
      TARGET_WIDTH,
      TARGET_HEIGHT
    );

    const compressedData = finalCtx.getImageData(
      0,
      0,
      TARGET_WIDTH,
      TARGET_HEIGHT
    );

    // Convert to grayscale and normalize to match MNIST format
    const normalizedData = new Uint8Array(TARGET_WIDTH * TARGET_HEIGHT);

    for (let i = 0; i < compressedData.data.length; i += 4) {
      // Convert RGBA to grayscale and invert (MNIST uses white background, black digits)
      normalizedData[i / 4] = 255 - compressedData.data[i + 3]; // Just use alpha channel
    }

    return normalizedData;
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    const originalImageData = contextRef.current.getImageData(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    const processedData = compressImageData(originalImageData);
    setImageData(processedData);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const startDrawingTouch = (e) => {
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Reset the image data to an empty canvas
    setImageData(new Uint8Array(TARGET_WIDTH * TARGET_HEIGHT).fill(255));
  };

  return (
    <>
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
      <button onClick={() => clearCanvas()}>clear</button>
    </>
  );
};

Canvas.propTypes = {
  setImageData: PropTypes.func.isRequired,
};

export default Canvas;
