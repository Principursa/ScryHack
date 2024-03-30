import { useState, useEffect } from "react";
import axios from "axios";

//import { useAccount, useWriteContract, useReadContract } from "wagmi";
import returnlogo from "../utils/getLogos";
//import { Contracts } from "../Abis/contracts";
//import { parseAbi, parseUnits } from "viem";
import convertUnixToDate from "../utils/convertDate";
//import abi here
const baseListUrl = " https://45.83.107.70/game/list";

interface gameObjectFE {
  id: string;
  home_team: string;
  away_team: string;
  home_points: number | string;
  away_points: number | string;
  commence_time: number; //in unix so smart contract conversion is easier
}

/* const bettingABI = parseAbi([
  "startBetProcess(string memory gameId, Team winningTeam)", //Might be some issues with the enum here
]);
 */
//function placeBet() {}

function Upcoming() {
  const [Games, setGames] = useState<gameObjectFE[]>();

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
                  <td>{returnlogo(game.home_team)}</td>
                  <td>{returnlogo(game.away_team)}</td>
                  <td>{game.home_points}</td>
                  <td>{game.away_points}</td>
                  <td>No bets yet</td>
                  <td>No bets yet</td>

                  <td>
                    <button className="text-white w-20">Bet</button>
                  </td>
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
