import React from "react";
import Navbar from "../Navbar";
import BallPlayer from "../assets/BallPlayer.svg"

function Landing() {
  return (
    <>
    <div className="h-screen w-screen bg-white">
      <Navbar />
      <div className="text-black">
        <p>Welcome To ScryBall!</p>
        <p>Here you can bet on BasketBall point spreads</p>

      </div>
        <img src={BallPlayer} alt="ballplayer" className="absolute bottom-0 " />
    </div>
</>
  );
}

export default Landing;
