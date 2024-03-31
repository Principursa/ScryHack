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
            <div className="pb-5 text-white text-center">
                @CopyRight 2024 - Scry Hackathon - Made for educational purposes within the contest
            </div>
        </>
    );
}

export default App;
