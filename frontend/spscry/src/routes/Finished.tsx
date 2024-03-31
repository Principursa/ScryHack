import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from '#/components/Table';
import { GameResultFE } from '#/types';
import { useAccount, useReadContract } from 'wagmi';
import { Contracts } from '../Abis/contracts';
import bettingABI from '../Abis/Betting.json';
const baseListUrl = 'https://eventbuddy.snake-py.com/game-results/list';

function Finished() {
    const [Games, setGames] = useState<GameResultFE[]>();
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
            console.log('response', response);
            console.log('bets', bets);
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
    }, [bets]);
    const disableButtonCb = (game: GamesForTable) => {
        // maybe do a check?
        return false;
    };

    return <>{Games ? <Table games={Games} disableButtonCb={disableButtonCb} /> : <></>}</>;
}

export default Finished;
