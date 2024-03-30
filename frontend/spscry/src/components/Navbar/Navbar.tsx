import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { CiBasketball } from 'react-icons/ci';
import { PropsWithChildren } from 'react';

const StyledNavElement = ({ to, children }: { to: string } & PropsWithChildren) => {
    return (
        <li className="mx-2">
            <Link
                to={to}
                className="text-white p-2 border-2 rounded-md block hover:bg-white hover:text-black"
            >
                {children}
            </Link>
        </li>
    );
};

const Logo = () => {
    return (
        <div className="flex justify-center items-center">
            <Link to={'/'} className="text-white p-2">
                <CiBasketball style={{ color: 'white', fontSize: '3rem' }} />
            </Link>
        </div>
    );
};

function Navbar() {
    return (
        <>
            <div className="w-full min-h-10 py-2 bg-gradient-to-r from-nba-blue to-nba-red flex">
                <div className="flex justify-between w-full">
                    <div className="flex">
                        <Logo />
                        <div>
                            <ul className="flex h-full justify-center items-center">
                                <StyledNavElement to={'/app/'}>Upcoming Games</StyledNavElement>
                                <StyledNavElement to={'/app/finished'}>
                                    Finished Games
                                </StyledNavElement>
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mr-3">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </>
    );
}
{
    /* <li className="mb-4">
                        <ConnectButton />
                    </li> */
}
export default Navbar;
