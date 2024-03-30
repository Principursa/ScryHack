import { Outlet } from 'react-router-dom';
// import '@rainbow-me/rainbowkit/styles.css';
import { Navbar } from './components/Navbar';

function App() {
    return (
        <>
            <Navbar />
            <div className="main-container ">
                <Outlet />
            </div>
            <div className="background-player"></div>
        </>
    );
}

export default App;
