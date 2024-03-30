'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

//import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Table } from '#/components/Table';
import { gameObjectFE } from '#/types';

const baseListUrl = ' https://eventbuddy.snake-py.com/game/list';

function Upcoming() {
    const [Games, setGames] = useState<gameObjectFE[]>();

    useEffect(() => {
        axios.get(baseListUrl).then((response: any) => {
            console.log('response', response);
            setGames(response.data);
        });
        console.log(Games);
    }, []);

    return <>{Games ? <Table isNotResult games={Games} /> : <></>}</>;
}

export default Upcoming;
