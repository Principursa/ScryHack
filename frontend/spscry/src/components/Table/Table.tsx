import { GamesForTable } from '#/types';
import convertUnixToDate from '#/utils/convertDate';
import returnlogo from '#/utils/getLogos';
import clsx from 'clsx';
import { Fragment, PropsWithChildren } from 'react';

const Cell = ({ colSpan, children }: { colSpan: number } & PropsWithChildren) => {
    const classes = clsx('text-white py-5 text-center', {
        'col-span-1': colSpan === 1,
        'col-span-2': colSpan === 2,
        'col-span-3': colSpan === 3,
        'col-span-4': colSpan === 4,
        'col-span-5': colSpan === 5,
        'col-span-6': colSpan === 6,
        'col-span-7': colSpan === 7,
        'col-span-8': colSpan === 8,
        'col-span-9': colSpan === 9,
        'col-span-10': colSpan === 10,
        'col-span-11': colSpan === 11,
        'col-span-12': colSpan === 12,
    });
    return <div className={classes}>{children}</div>;
};

function Table({
    onClickCB,
    games,
    isNotResult,
    disableButtonCb,
}: {
    games: GamesForTable[];
    isNotResult?: boolean;
    onClickCB?: (game: GamesForTable, isNotResult?: boolean) => void;
    disableButtonCb?: (game: GamesForTable) => boolean;
}) {
    return (
        <>
            <div
                className="flex"
                style={{
                    width: '70%',
                }}
            >
                <div className="w-full bg-my-bg-color neumorphism">
                    <div className=" grid-cols-12 grid w-full">
                        <Cell colSpan={2}>Date</Cell>
                        <Cell colSpan={2}>Home Team</Cell>
                        <Cell colSpan={2}>Away Team</Cell>
                        <Cell colSpan={1}>{isNotResult ? 'Home Odds' : 'Home Score'}</Cell>
                        <Cell colSpan={1}>{isNotResult ? 'Away Odds' : 'Away Score'}</Cell>
                        <Cell colSpan={1}>Bets</Cell>
                        <Cell colSpan={1}>In Pot</Cell>
                        <Cell colSpan={2}>Action</Cell>
                    </div>
                    <div
                        style={{ height: '3px', width: '100%', minWidth: '100%' }}
                        className="bg-gradient-to-r from-nba-blue to-nba-red"
                    ></div>
                    <div className=" grid-cols-12 grid w-full">
                        {games?.map((game) => (
                            <Fragment key={game.id}>
                                <Cell colSpan={2}>{convertUnixToDate(game.commence_time)}</Cell>
                                <Cell colSpan={2}>
                                    <span className="table-content__logo-container">
                                        {returnlogo(game.home_team)}
                                    </span>
                                </Cell>
                                <Cell colSpan={2}>
                                    <span className="table-content__logo-container">
                                        {returnlogo(game.away_team)}
                                    </span>
                                </Cell>
                                <Cell colSpan={1}>
                                    {isNotResult ? game.home_points : game.home_score}
                                </Cell>
                                <Cell colSpan={1}>
                                    {isNotResult ? game.away_points : game.away_score}
                                </Cell>
                                <Cell colSpan={1}>{game?.betsLength}</Cell>
                                <Cell colSpan={1}>{(game?.betsLength || 0) * 0.1} Eth</Cell>
                                <Cell colSpan={2}>
                                    <button
                                        disabled={disableButtonCb ? disableButtonCb(game) : false}
                                        onClick={() =>
                                            onClickCB ? onClickCB(game, isNotResult) : null
                                        }
                                        className="
                                        hover:bg-white hover:text-nba-blue
                                        ease-in-out duration-300
                                        rounded border border-white px-6 py-2"
                                    >
                                        {isNotResult ? 'Bet' : 'Check Result'}
                                    </button>
                                </Cell>
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Table;
