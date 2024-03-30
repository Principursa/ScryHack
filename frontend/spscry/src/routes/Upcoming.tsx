"use client";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWatchPendingTransactions,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type UseWriteContractReturnType } from 'wagmi'

import returnlogo from "../utils/getLogos";
import { Contracts } from "../Abis/contracts";
import bettingABI from "../Abis/Betting.json";
import { parseAbi, parseUnits, parseEther } from "viem";
import convertUnixToDate from "../utils/convertDate";

const baseListUrl = " https://eventbuddy.snake-py.com/game/list";

interface gameObjectFE {
  id: string;
  home_team: string;
  away_team: string;
  home_points: number | string;
  away_points: number | string;
  commence_time: number; //in unix so smart contract conversion is easier
}

/*  const bettingABI = parseAbi([
  "startBetProcess(string memory gameId, Team winningTeam)", //Might be some issues with the enum here
]); */
interface txInit {
  teamName: string;
  initiated: boolean;
}

function Upcoming() {
  const [Games, setGames] = useState<gameObjectFE[]>();
  const [txInitiated, setTxInitiated] = useState<txInit>({
    teamName: "",
    initiated: false,
  });
  //Make this have a teamname + boolean structure

  const { isPending, writeContract, isError, error } = useWriteContract();

  function placeBetInitial(id: string, team: number, teamname: string) {
    const { data : trx } = writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "startBetProcess",
      args: [id, team],
      value: parseEther("0.1005"),
      onSuccess: () => {
        setTxInitiated({
          teamName: teamname,
          initiated: true,
        });
        console.log("success from write contract");
      },
    });
    console.log("hash",trx)
    const result = useWaitForTransactionReceipt({
      hash: trx?.hash,
      confirmations: 1,
      onSuccess: () => {
        setTxInitiated({
          teamName: teamname,
          initiated: true,
        });
        console.log("success from wait tx")
      },
    });
    console.log(result);

    console.log(isError);
    console.log(error);
  }

  function finalizeBet() {
    const { data: bets } = useReadContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "getMyBets",
      args: [],
    });
    console.log("bets:", bets);
    const length = bets.length;
    const latestBet = bets[length - 1];
    console.log("latestBet:", latestBet);
    const betTx = writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "finalizeBetProcess",
      args: [latestBet.betId],
    });
    setTxInitiated({
      teamName: "",
      initiated: false,
    });
  }

  useEffect(() => {
    axios.get(baseListUrl).then((response: any) => {
      console.log("response", response);
      setGames(response.data);
    });
    console.log(Games);
  }, []);

  return (
    <>
      <div className="grid grid-cols-7">
        <div className="text-black flex flex-col col-start-2 col-span-5 items-center">
          <h1> Upcoming Games</h1>
          <table className="text-black w-50 h-50 border-black">
            <tbody>
              <tr className="border-b-4 border-black ">
                <th>Date</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Home Odds</th>
                <th>Away Odds</th>
                <th>Current Bet</th>
                <th>Allowed Bet</th>
                <th></th>
              </tr>
              {Games?.map((game, index) => (
                <tr key={index.toString()}>
                  <td>{convertUnixToDate(game.commence_time)}</td>
                  <td>
                    {returnlogo(game.home_team)}
                    {txInitiated.teamName == game.home_team &&
                    txInitiated.initiated == true ? (
                      <button
                        className="text-white w-20 "
                        onClick={() => finalizeBet()}
                      >
                        Finalize Bet
                      </button>
                    ) : (
                      <button
                        className="text-white w-20 "
                        onClick={() =>
                          placeBetInitial(game.id, 0, game.home_team)
                        }
                      >
                        Bet
                      </button>
                    )}
                  </td>
                  <td>
                    {returnlogo(game.away_team)}

                    <button
                      className="text-white w-20 "
                      onClick={() =>
                        placeBetInitial(game.id, 1, game.away_team)
                      }
                    >
                      Bet
                    </button>
                  </td>
                  <td>{game.home_points}</td>
                  <td>{game.away_points}</td>
                  <td>No bets yet</td>
                  <td>No bets yet</td>

                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Upcoming;
