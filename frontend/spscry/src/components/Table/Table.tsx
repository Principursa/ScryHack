import { GamesForTable } from '#/types';
import convertUnixToDate from '#/utils/convertDate';
import returnlogo from '#/utils/getLogos';
import clsx from 'clsx';
import { Fragment, PropsWithChildren } from 'react';

const Cell = ({ colSpan, children }: { colSpan: number } & PropsWithChildren) => {
    const classes = clsx('text-white py-5 text-center', `col-span-${colSpan}`);
    return <div className={classes}>{children}</div>;
};

function Table({ games, isNotResult }: { games: GamesForTable[]; isNotResult?: boolean }) {
    return (
        <>
            <div
                className="flex"
                style={{
                    minWidth: '70%',
                }}
            >
                <div className="w-full bg-my-bg-color neumorphism">
                    <div className=" grid-cols-12 grid w-full">
                        <Cell colSpan={2}>Date</Cell>
                        <Cell colSpan={2}>Home Team</Cell>
                        <Cell colSpan={2}>Away Team</Cell>
                        <Cell colSpan={1}>{isNotResult ? 'Home Odds' : 'Home Score'}</Cell>
                        <Cell colSpan={1}>{isNotResult ? 'Away Odds' : 'Away Score'}</Cell>
                        <Cell colSpan={1}>Current Bet</Cell>
                        <Cell colSpan={1}>Allowed Bet</Cell>
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
                                <Cell colSpan={1}>No bets yet</Cell>
                                <Cell colSpan={1}>No bets yet</Cell>
                                <Cell colSpan={2}>Action</Cell>
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Table;
