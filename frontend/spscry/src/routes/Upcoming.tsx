'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { Table } from '#/components/Table';
import { GamesForTable, gameObjectFE } from '#/types';
/*import {
  useWriteContract,
 // useReadContract,
 // useWaitForTransactionReceipt,
} from "wagmi";

import { Contracts } from "../Abis/contracts";
import bettingABI from "../Abis/Betting.json";
import { parseEther } from "viem";*/

const baseListUrl = ' https://eventbuddy.snake-py.com/game/list';

/* interface txInit {
  teamName: string;
  initiated: boolean;
} */

const Modal = ({ game, onCloseModal }: { game: GamesForTable; onCloseModal: () => void }) => {
    return (
        <div
            onClick={onCloseModal}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
                <h2 className="font-thin">You are about to place a bet! Exciting!</h2>
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
                <div
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        display: 'flex',
                    }}
                >
                    <div className="font-thin text-white p-2 rounded mt-5 mr-5">
                        Required 0.1005 Ether
                    </div>
                    <button className="bg-green-500 text-white p-2 rounded mt-5 mr-5">
                        Bet on {game.home_team} ({game.home_points})
                    </button>
                    <button className="bg-green-500 text-white p-2 rounded mt-5">
                        Bet on {game.away_team} ({game.away_points})
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
    //const [txInitiated, setTxInitiated] = useState<txInit>({
    //  teamName: "",
    // initiated: false,
    /* });*/
    //Make this have a teamname + boolean structure

    /* const { writeContract, isError, error } = useWriteContract(); */

    /* function placeBetInitial(id: string, team: number, teamname: string) {
    writeContract({
      abi: bettingABI.abi,
      address: Contracts.bettingContract,
      functionName: "startBetProcess",
      args: [id, team],
      value: parseEther("0.1005"),
    });*/
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
    /*  setTxInitiated({
      teamName: teamname,
      initiated: true,
    });

    console.log(isError);
    console.log(error);
  } */

    /*function finalizeBet() {
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
    //}
    useEffect(() => {
        axios.get(baseListUrl).then((response: any) => {
            console.log('response', response);
            setGames(response.data);
        });
        console.log(Games);
    }, []);
    const onClick = (game: GamesForTable) => {
        console.log('clicked', game);
        setModalGame(game);
        setIsOpen(true);
    };

    const disableButtonCb = (game: GamesForTable) => {
        //@TODO: Implement logic to disable button
        return false;
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
                    <Table
                        isNotResult
                        games={Games}
                        onClickCB={onClick}
                        disableButtonCb={disableButtonCb}
                    />
                </>
            ) : (
                <></>
            )}
        </>
    );
}

export default Upcoming;
