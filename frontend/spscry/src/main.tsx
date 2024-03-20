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
import Moneyline from "./routes/Moneyline";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing/>
  },
  {
    path: "/App",
    element: <App/>,
    children: [
      {
        path: "bets",
        element: <Moneyline/>,
      }
    ]
  }
])

const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
