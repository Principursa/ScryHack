"use client";
import { useState, useEffect } from "react";
import axios from "axios";

import { Table } from "#/components/Table";
import { GamesForTable, gameObjectFE } from "#/types";
import {
  useWriteContract,
  useReadContract,
  // useWaitForTransactionReceipt,
} from "wagmi";

import { Contracts } from "../Abis/contracts";
import bettingABI from "../Abis/Betting.json";
import { parseEther } from "viem";

const baseListUrl = " https://eventbuddy.snake-py.com/game/list";

interface txInit {
  teamName: string;
  initiated: boolean;
}

const Modal = ({
  game,
  onCloseModal,
}: {
  game: GamesForTable;
  onCloseModal: () => void;
}) => {
  const [txInitiated, setTxInitiated] = useState<txInit>({
    teamName: "",
    initiated: false,
  });
    let {result : myBets} = useReadContract({
        abi: bettingABI.abi,
        address: Contracts.bettingContract,
        functionName: "getMyBets",
        args: []
    })

  const { writeContract, isError, error } = useWriteContract();

  function finalizeBet() {
    console.log(myBets)
    console.log(txInitiated)

/*     const { data: bets } = useReadContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "getMyBets",
      args: [],
    }); */
  }
  function placeBetInitial(id: string, team: number, teamname: string) {
    writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "startBetProcess",
      args: [id, team],
      value: parseEther("0.1005"),
    });
    /* const result = useWaitForTransactionReceipt({
      hash: trx?.hash,
      confirmations: 1,
      onSuccess: () => {
        setTxInitiated({
          teamName: teamname,
          initiated: true,
        });
        console.log("success from wait tx");
      },
    });
    console.log(result); */

    setTxInitiated({
      teamName: teamname,
      initiated: true,
    });

    console.log(isError);
    console.log(error);
  }

  /*     const length = bets.length;
    const latestBet = bets[length - 1];
    console.log("latestBet:", latestBet);
    writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "finalizeBetProcess",
      args: [latestBet.betId],
    });
    setTxInitiated({
      teamName: "",
      initiated: false,
    }); */

  return (
    <div
      onClick={onCloseModal}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "50%",
          height: "50%",
          backgroundColor: "var(--bg-color)",
          padding: "20px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          color: "white",
          position: "relative",
        }}
      >
        <h1 className="font-bold mb-5">
          Place a bet on {game.home_team} vs {game.away_team}
        </h1>
        <p>Placing a bet means this process...</p>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            display: "flex",
          }}
        >
          <button
            className="bg-green-500 text-white p-2 rounded mt-5 mr-5"
            onClick={() => placeBetInitial(game.id, 0, game.home_team)}
          >
            Bet on Home Team
          </button>
          <button
            className="bg-green-500 text-white p-2 rounded mt-5"
            onClick={() => placeBetInitial(game.id, 1, game.away_team)}
          >
            Bet on Away Team
          </button>

          <button
            className="bg-green-500 text-white p-2 rounded mt-5"
            onClick={() => finalizeBet()}
          >
            Finalize Bet
          </button>
        </div>
      </div>
    </div>
  );
};

function Upcoming() {
  const [Games, setGames] = useState<gameObjectFE[]>();
  const [modalGame, setModalGame] = useState<GamesForTable>();
  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios.get(baseListUrl).then((response: any) => {
      console.log("response", response);
      setGames(response.data);
    });
    console.log(Games);
  }, []);
  const onClick = (game: GamesForTable) => {
    console.log("clicked", game);
    setModalGame(game);
    setIsOpen(true);
  };

  return (
    <>
      {Games ? (
        <>
          {modalIsOpen && modalGame && (
            <Modal
              game={modalGame}
              onCloseModal={() => {
                setIsOpen(false);
                setModalGame(undefined);
              }}
            />
          )}
          <Table isNotResult games={Games} onClickCB={onClick} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default Upcoming;
