import { useState } from "react";
import reactLogo from "./assets/react.svg";

import "@rainbow-me/rainbowkit/styles.css";

import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./Navbar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="h-screen w-screen bg-white">
        <Navbar/>
      
      </div>
    </>
  );
}

export default App;
