import { useState, useEffect } from 'react';
import axios from 'axios';

import { Table } from '#/components/Table';
import { GamesForTable, gameObjectFE } from '#/types';
import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import BigNumber from 'bignumber.js';

import { Contracts } from '../Abis/contracts';
import bettingABI from '../Abis/Betting.json';
import { parseEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

const baseListUrl = ' https://eventbuddy.snake-py.com/game/list';
interface txInit {
    teamName: string;
    initiated: boolean;
}

const Modal = ({ game, onCloseModal }: { game: GamesForTable; onCloseModal: () => void }) => {
    const [isFinalized, setIsFinalized] = useState(false);
    const account = useAccount();
    const [txInitiated, setTxInitiated] = useState<txInit>({
        teamName: '',
        initiated: false,
    });
    const { data: myBets, refetch } = useReadContract({
        abi: bettingABI.abi,
        address: Contracts.bettingContract,
        functionName: 'getMyBets',
        account: account.address,
    });

    const {
        isError: isInitError,
        error: initError,
        isSuccess: isInitSuccess,
        data: hashInit,
        writeContract: init,
    } = useWriteContract();

    const { isError, error, data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    async function finalizeBet() {
        console.log(account.address);
        console.log(txInitiated);
        const { data } = await refetch();
        const bets = data as { betId: string; status: number }[];
        console.log('bets', bets);
        const latestBet = bets[bets.length - 1];
        if (!latestBet || latestBet.status != 0) {
            return;
        }
        const latestBetId = new BigNumber(latestBet.betId);
        console.log('latestBetId', latestBetId.toNumber());
        writeContract({
            abi: bettingABI.abi,
            address: Contracts.bettingContract,
            functionName: 'finalizeBetProcess',
            args: [latestBetId.toNumber()],
        });
        setTxInitiated({
            teamName: '',
            initiated: false,
        });
        console.log(hash);
        console.log(txInitiated);
        console.log(isError, error);

        setIsFinalized(true);
    }
    function placeBetInitial(id: string, team: number, teamname: string) {
        setTxInitiated({
            teamName: teamname,
            initiated: true,
        });
        init({
            abi: bettingABI.abi,
            address: Contracts.bettingContract,
            functionName: 'startBetProcess',
            args: [id, team],
            value: parseEther('0.1005'),
        });

        console.log('txinit', txInitiated);

        console.log('isInitError', isInitError);
        console.log('initError', initError);
    }

    return (
        <>
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
                {!isFinalized ? (
                    <div onClick={(e) => e.stopPropagation()} className="modal">
                        <h1
                            style={{
                                fontSize: '1.5rem',
                            }}
                        >
                            Place a bet on <b>{game.home_team}</b> vs <b>{game.away_team}</b>
                        </h1>
                        <h2 className="font-thin">
                            You think you have what it takes..? You ready to get down and put some
                            money on the line!?
                        </h2>
                        <hr className="mb-8" />
                        <p style={{ textAlign: 'justify', marginBottom: '100px' }}>
                            We just want to make sure you know what you are getting yourself into!
                            Clicking one of the buttons below will cause the Frontend to connect to
                            our SmartContract. To place a bet you will need to do in total 2
                            transactions. The first transaction will be to start the betting process
                            and the second transaction will be to finalize the bet. You can only bet
                            a fixed amount of 0.1 ETH! The bet will be placed on the team you choose
                            below. You will win the bet according to spread points. Note to interact
                            with the SmartContract you will need to pay a small fee. This fee is not
                            included in the 0.1 ETH you bet. The fee is 0.0005 ETH. If you don't
                            place a bet with 0.1005 ETH the bet will not be placed.
                        </p>

                        {isConfirming && <div>Waiting for confirmation...</div>}
                        {isConfirmed && <div>Transaction confirmed.</div>}

                        <div
                            style={{
                                position: 'absolute',
                                bottom: 20,
                                right: 20,
                                display: 'flex',
                            }}
                        >
                            {txInitiated.initiated == true ? (
                                <button
                                    disabled={!isInitSuccess}
                                    className="bg-green-500 text-white p-2 rounded mt-5"
                                    onClick={() => finalizeBet()}
                                >
                                    Finalize Bet
                                </button>
                            ) : (
                                <div className="flex">
                                    <div className="font-thin text-white p-2 rounded mt-5 mr-5">
                                        Required 0.1005 Ether
                                    </div>
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
                ) : (
                    <div onClick={(e) => e.stopPropagation()} className="modal">
                        <h1 style={{ fontSize: '1.5rem' }}>Bet Finalized</h1>
                        <h2 className="font-thin">You have successfully placed your bet!</h2>
                        <hr className="mb-8" />
                        <p style={{ textAlign: 'justify' }}>
                            You have successfully placed your bet on <b>{txInitiated.teamName}</b>!
                            The bet will be finalized once the game has ended. You will be able to
                            check the result of the game once the game has ended. Good luck!
                        </p>
                        <button
                            onClick={() => {
                                setIsFinalized(false);
                                onCloseModal();
                            }}
                            className="bg-green-500 text-white p-2 rounded mt-5"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

function Upcoming() {
    const [Games, setGames] = useState<gameObjectFE[]>();
    const [modalGame, setModalGame] = useState<GamesForTable>();
    const [modalIsOpen, setIsOpen] = useState(false);
    const account = useAccount();

    const { data: bets } = useReadContract({
        abi: bettingABI.abi,
        address: Contracts.bettingContract,
        functionName: 'getBets',
        account: account.address,
    });

    useEffect(() => {
        axios.get(baseListUrl).then((response: any) => {
            let gameObjects = response.data;
            if (bets && Array.isArray(bets)) {
                gameObjects = gameObjects.map((game) => {
                    const bet = bets.filter((bet) => bet.gameId === game.id);
                    if (bet) {
                        game.betsLength = bet.length;
                    }
                    return game;
                });
            }
            setGames(gameObjects);
        });
        console.log(Games);
    }, [bets, modalIsOpen]);
    const onClick = (game: GamesForTable) => {
        setModalGame(game);
        setIsOpen(true);
    };
    const disableButtonCb = (game: GamesForTable) => {
        if (game.commence_time > Date.now() / 1000) {
            return false;
        }
        return true;
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
