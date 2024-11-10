import { useEffect, useState } from 'react';
import Canvas from './components/Canvas';

const App = () => {
  const [imageData, setImageData] = useState(null);
  
  useEffect(() => {
    console.log(imageData);
  }, [imageData]);

  return (
    <>
      <p>draw a digit 0-9</p>
      <Canvas setImageData={setImageData} />
    </>
  );
};

export default App;
