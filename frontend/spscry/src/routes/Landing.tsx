import BallPlayer from '../assets/BallPlayer.svg';

function Landing() {
    return (
        <>
            <div className="text-black">
                <p>Welcome To ScryBall!</p>
                <p>Here you can bet on BasketBall point spreads</p>
            </div>
            <img src={BallPlayer} alt="ballplayer" className="absolute bottom-0 " />
        </>
    );
}

export default Landing;
