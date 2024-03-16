import logo from './logo.svg';
import './App.css';
import UploadFile from './components/uploadFile/uploadFile.js';
import { Routes, Route } from 'react-router-dom';
import Display from './components/display/display.js';


function App() {
  return (
    <div className="App">
     <>
       <Routes>
          <Route path="/" element={<UploadFile />} />
          <Route path="/display" element={<Display />} />
       </Routes>
    </>
    </div>
  );
}

export default App;
