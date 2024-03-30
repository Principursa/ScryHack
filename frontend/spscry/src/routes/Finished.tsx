import { useState, useEffect } from "react";
import axios from "axios";
import returnlogo from "../utils/getLogos";
import convertUnixToDate from "../utils/convertDate";

const baseListUrl = "http://localhost:3000/game-results/list";

interface GameResultFE {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  commence_time: number;
  completed: boolean;
}
function Finished() {
  const [Games, setGames] = useState<GameResultFE[]>();

  useEffect(() => {
    axios.get(baseListUrl).then((response: any) => {
      console.log("repsonse:", response);
      setGames(response.data);
    });
  }, []);

  return(
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
                <th>Home Score</th>
                <th>Away Score </th>
                <th>Status</th>
                <th></th>
              </tr>
              {Games?.map((game, index) => (
                <tr key={index.toString()}>
                  <td>{convertUnixToDate(game.commence_time)}</td>
                  <td>{returnlogo(game.home_team)}</td>
                  <td>{returnlogo(game.away_team)}</td>
                  <td>{game.home_score}</td>
                  <td>{game.home_score}</td>
                  <td>{game.completed}</td>

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
   

  )
}

export default Finished;
