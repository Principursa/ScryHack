"use client";
import { useState, useEffect } from "react";
import axios from "axios";

import { Table } from "#/components/Table";
import { GamesForTable, gameObjectFE } from "#/types";
import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import BigNumber from "bignumber.js";

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
  const account = useAccount();
  const [txInitiated, setTxInitiated] = useState<txInit>({
    teamName: "",
    initiated: false,
  });
// @ts-ignore
  let { data: myBets } = useReadContract({
    abi: bettingABI.abi,
    address: Contracts.bettingContract,
    functionName: "getMyBets",
    account: account.address,
  });

  const { isError, error, data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  function finalizeBet() {
    console.log(account.address);
    console.log(txInitiated);
    // @ts-ignore
    const latestBetId = new BigNumber(myBets[myBets.length - 1].betId);
    console.log(latestBetId.toNumber());
    writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "finalizeBetProcess",
      args: [latestBetId.toNumber()],
    });
    setTxInitiated({
      teamName: "",
      initiated: false,
    });
    console.log(hash);
    console.log(txInitiated);
    console.log(isError, error);
  }
  function placeBetInitial(id: string, team: number, teamname: string) {
    setTxInitiated({
      teamName: teamname,
      initiated: true,
    });
    writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "startBetProcess",
      args: [id, team],
      value: parseEther("0.1005"),
    });

    console.log("txinit", txInitiated);

    console.log("isError", isError);
    console.log("error", error);
  }


  return (
    <>
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
            <div onClick={(e) => e.stopPropagation()} className="modal">
                <h1
                    style={{
                        fontSize: '1.5rem',
                    }}
                >
                    Place a bet on <b>{game.home_team}</b> vs <b>{game.away_team}</b>
                </h1>
                <h2 className="font-thin">You think you have what it takes..? You ready to get down and put some money on the line!?</h2>
                <hr className="mb-8" />
                <p style={{ textAlign: 'justify', marginBottom: '100px' }}>
                    We just want to make sure you know what you are getting yourself into! Clicking
                    one of the buttons below will cause the Frontend to connect to our
                    SmartContract. To place a bet you will need to do in total 2 transactions. The
                    first transaction will be to start the betting process and the second
                    transaction will be to finalize the bet. You can only bet a fixed amount of 0.1
                    ETH! The bet will be placed on the team you choose below. You will win the bet
                    according to spread points. Note to interact with the SmartContract you will
                    need to pay a small fee. This fee is not included in the 0.1 ETH you bet. The
                    fee is 0.0005 ETH. If you don't place a bet with 0.1005 ETH the bet will not be
                    placed.
                </p>

   
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed.</div>}



// @ts-ignore
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              text: "white"
            }}
          >
            {txInitiated.initiated == true ? (
              <button
                className="bg-green-500 text-white p-2 rounded mt-5"
                onClick={() => finalizeBet()}
              >
                Finalize Bet
              </button>
            ) : (
              <div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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
