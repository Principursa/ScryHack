import React from 'react'
import { Outlet, Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Navbar() {
  return (
    <>
  <div className="bg-white w-screen p-4">
          <ul className="h-10 flex border-b-4 border-slate-300  flex-row justify-evenly items-center visited:text-white p-b-2">
            <li>
              <Link to={"/"} className="text-black font-bold text-m m-2">SCRYSPORTS</Link>
            </li>
            <li className="text-black">
              <Link
                to={"/app/"}
                className="text-black hover:text-emerald-300 text-m m-2"
              >
                Upcoming Games
              </Link>
            </li>
            <li>
              <Link
                to={`/app/finished`}
                className="text-black hover:text-emerald-300 text-m "
              >
                Finished Games
              </Link>
            </li>
            <li className="mb-4">
              <ConnectButton />
            </li>
          </ul>
        </div>
        <div className="flex flex-row justify-items justify-center">
          <Outlet />
        </div>
    </>
  )
}

export default Navbar