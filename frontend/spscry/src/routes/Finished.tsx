import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from '#/components/Table';
import { GameResultFE, GamesForTable } from '#/types';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Contracts } from '../Abis/contracts';
import bettingABI from '../Abis/Betting.json';
const baseListUrl = 'https://eventbuddy.snake-py.com/game-results/list';

function Finished() {
    const [Games, setGames] = useState<GameResultFE[]>();
    const account = useAccount();
    const [gameIdForResultHash, setGameIdForResultHash] = useState<string>();
    const { data: bets } = useReadContract({
        abi: bettingABI.abi,
        address: Contracts.bettingContract,
        functionName: 'getBets',
        account: account.address,
    });
    const { data: gameResultHash, writeContract } = useWriteContract();
    const { writeContract: distribute } = useWriteContract();

    useEffect(() => {
        axios.get(baseListUrl).then((response: any) => {
            let gameObjects = response.data;
            console.log('response', response);
            console.log('bets', bets);
            if (bets && Array.isArray(bets)) {
                gameObjects = gameObjects.map((game) => {
                    const bet = bets.filter((bet) => bet.gameId === game.id);
                    if (bet) {
                        game.betsLength = bet.length;
                    }
                    if (gameIdForResultHash == game.id) {
                        game.gameResultHash = gameResultHash;
                    }
                    return game;
                });
            }
            setGames(gameObjects);
        });
        console.log(Games);
    }, [bets, gameResultHash]);

    const onClick = (game: GamesForTable) => {
        if (!game.gameResultHash) {
            writeContract({
                abi: bettingABI.abi,
                address: Contracts.bettingContract,
                functionName: 'checkGameResult',
                args: [game.id],
            });
            setGameIdForResultHash(game.id);
            return;
        }
        console.log('distribute');
        distribute({
            abi: bettingABI.abi,
            address: Contracts.bettingContract,
            functionName: 'distribute',
            args: [game.id],
        });
        setGameIdForResultHash(undefined);
    };

    const disableButtonCb = (game: GamesForTable) => {
        if (game.commence_time < Date.now() / 1000) {
            return false;
        }
        return true;
    };

    return (
        <>
            {Games ? (
                <Table games={Games} disableButtonCb={disableButtonCb} onClickCB={onClick} />
            ) : (
                <></>
            )}
        </>
    );
}

export default Finished;
