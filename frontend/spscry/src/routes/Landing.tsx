import clsx from 'clsx';
import { Link } from 'react-router-dom';

function Landing() {
    const btnClasses = clsx(
        'bg-gradient-to-tr from-nba-blue to-nba-red px-5 py-2 rounded text-white bold duration-300 ease-in-out',
        'hover:scale-110 hover:shadow-lg hover:font-bold'
    );
    return (
        <>
            <div className="glass glass-container">
                <div className="flex justify-center">
                    <div className="flex flex-col justify-center items-center">
                        <h1
                            style={{ fontSize: '2rem' }}
                            className="mb-8 font-bold  text-white text-lg"
                        >
                            ScryBall
                        </h1>
                        <p
                            className="mb-8 bold text-white "
                            style={{ width: '80%', textAlign: 'justify' }}
                        >
                            ScryBall is a decentralized application (dApp) that leverages Scry, a
                            blockchain oracle, to access odds from traditional web 2.0 APIs. It
                            offers sports betting enthusiasts, particularly NBA fans, a seamless and
                            decentralized betting experience. By connecting your MetaMask wallet to
                            our frontend, you can effortlessly place bets on NBA games. While we're
                            starting with the NBA, the platform is designed to be easily extended to
                            other sports. <br /> <br />
                            <b>Here's how it works:</b> when you're ready to place a bet, you simply
                            indicate the specific game (using the gameId), and your prediction for
                            the winning team. Our smart contract (SC) takes it from there, employing
                            Scry to fetch the necessary data to process your bet. After the
                            conclusion of the game, the smart contract utilizes Scry once more to
                            verify the game's outcome. Winners are then determined, and winnings are
                            distributed accordingly. This process ensures a transparent, efficient,
                            and trustless betting environment for all users.
                        </p>
                        <Link to={'/app/'} className={btnClasses}>
                            Go to Games
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Landing;
