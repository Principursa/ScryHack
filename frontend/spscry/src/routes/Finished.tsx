import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from '#/components/Table';
import { GameResultFE } from '#/types';

const baseListUrl = 'https://eventbuddy.snake-py.com/game-results/list';

function Finished() {
    const [Games, setGames] = useState<GameResultFE[]>();

    useEffect(() => {
        axios.get(baseListUrl).then((response: any) => {
            console.log('repsonse:', response);
            setGames(response.data);
        });
    }, []);
    return <>{Games ? <Table games={Games} /> : <></>}</>;
}

export default Finished;
