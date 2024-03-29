import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "./configs/config";
import Landing from "./routes/Landing";
import { Router } from "../node_modules/react-router-dom/dist/index";
import Upcoming from "./routes/Upcoming";
import Finished from "./routes/Finished";


//Was thinking to have pages for the landing, upcoming games and finished games.

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing/>
  },
  {
    path: "/app",
    element: <App/>,
    children: [
      {
        path: "",
        element: <Upcoming/>,
      },
      {
        path: "finished",
        element: <Finished/> ,
      },
    ]
  }
])

const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider className="m-0">
          <RouterProvider router={router} className="m-0"/>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
