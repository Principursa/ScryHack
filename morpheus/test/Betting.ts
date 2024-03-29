import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';
import { BigNumberish } from 'ethers';

function encodeGameData(odds: string, commenceTime: number) {
    const [numerator, denominator] = odds.split(':').map(Number);
    // Adjust sizes here and in Solidity if this assumption doesn't hold.
    const numeratorBigInt = BigInt(numerator);
    const denominatorBigInt = BigInt(denominator);

    // CommenceTime should fit within 32 bits, adjust if necessary
    const encodedCommenceTime = BigInt(commenceTime);

    // Combine encodedOdds and encodedCommenceTime into one uint256
    // encodedOdds occupies the higher bits and encodedCommenceTime the lower
    return (numeratorBigInt << 8n) | (denominatorBigInt << 16n) | (encodedCommenceTime << 32n);
}

function getDate(date: string) {
    return Math.floor(new Date(date).getTime() / 1000);
}

/**
 * Important note! The Mock returns static data so it does not matter what id you will put into the transaction call.
 * It will always return the same data for the first transaction call and so on.
 */
describe('Betting', function async() {
    async function deployFixture() {
        const [owner, player1, player2] = await hre.ethers.getSigners();
        const gameIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        const MIN_BET = hre.ethers.parseEther('0.1');
        const ORACLE_FEE = hre.ethers.parseEther('0.001');
        const CONTRACT_FEE = hre.ethers.parseEther('0.001');

        const MIN_PAYMENT = hre.ethers.parseEther('0.1005');

        const MockMorpheus = await hre.ethers.getContractFactory('MockMorpheus');
        const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
        const games = {
            homeScores: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            awayScores: [42, 43, 49, 50, 44, 51, 50, 50, 50, 50],
            commenceTimes: [
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds - 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
                BigInt(currentTimestampInSeconds + 3600 * 24 * 7),
            ],
            odds: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
        };

        const mockMorpheus = await MockMorpheus.deploy(
            gameIds,
            games.odds.map((odd) => BigInt(odd)),
            games.commenceTimes,
            games.homeScores.map((score) => BigInt(score)),
            games.awayScores.map((score) => BigInt(score))
        );
        const address = mockMorpheus.getAddress();

        const connectedMock = mockMorpheus.connect(owner);

        const Betting = await hre.ethers.getContractFactory('Betting');
        const betting = await Betting.deploy(address, { from: owner.address });
        const bettingWithPlayer1 = betting.connect(player1);
        const bettingWithPlayer2 = betting.connect(player2);

        return {
            betting,
            mockMorpheus,
            owner,
            player1,
            player2,
            bettingWithPlayer1,
            bettingWithPlayer2,
            MIN_BET,
            ORACLE_FEE,
            CONTRACT_FEE,
            MIN_PAYMENT,
            gameIds,
            connectedMock,
        };
    }

    it('should be connected to the oracle', async () => {
        const { betting, mockMorpheus } = await loadFixture(deployFixture);
        const MockAddress = await mockMorpheus.getAddress();
        const oracleAddress = await betting.morpheus();
        expect(oracleAddress).to.equal(MockAddress);
    });

    describe('Betting basic functions and variable test', async () => {
        it('should correctly build the game data url', async () => {
            const { betting } = await loadFixture(deployFixture);
            const gameId = 'some-id';
            const endPoints = 'https://api.sportmonks.com/some-endpoint';
            const url = await betting.buildGameDataUrl(endPoints, '/game/', gameId);
            await expect(url).equals('https://api.sportmonks.com/some-endpoint/game/' + gameId);
        });
        it('should encode decode values from api correctly', async () => {
            const { betting } = await loadFixture(deployFixture);
            const timestamp = getDate('2025-12-25T12:00:00Z');
            const encodedValues = encodeGameData('10:2', timestamp);
            const tx = await betting.decodeValues(encodedValues);
            await expect(tx[0]).to.equal(10);
            await expect(tx[1]).to.equal(2);
            await expect(tx[2]).to.equal(timestamp);
        });

        it('should correctly compute a winning bet', async () => {
            const { betting } = await loadFixture(deployFixture);

            // betted on home team

            // (with 1 point more than required to win the bet) home was favored 7 to -7 and the game ended 50 to 42
            const tx1 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(0),
                BigInt(50),
                BigInt(42)
            );
            await expect(tx1).to.equal(true);

            // home was favored 7 to -7 and the game ended 50 to 43
            const tx2 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(0),
                BigInt(50),
                BigInt(43)
            );
            await expect(tx2).to.equal(true);

            // home was unfavored -7 to 7 and the game ended 50 to 49 (underdog home won)
            const tx3 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(0),
                BigInt(49),
                BigInt(50)
            );
            await expect(tx3).to.equal(true);

            // home was favored 7 to -7 and the game ended 50 to 50 (tie)
            const tx4 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(0),
                BigInt(50),
                BigInt(50)
            );
            await expect(tx4).to.equal(false);

            // home was favored 7 to -7 and the game ended 50 to 44 (home won but not by enough)
            const tx5 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(0),
                BigInt(50),
                BigInt(44)
            );
            await expect(tx5).to.equal(false);

            // home was favored 7 to -7 and the game ended 50 to 51 (home lost)
            const tx6 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(0),
                BigInt(50),
                BigInt(51)
            );
            await expect(tx6).to.equal(false);

            // betted on away team
            // away was favored 7 to -7 and the game ended 42 to 50
            const tx7 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(1),
                BigInt(42),
                BigInt(50)
            );
            await expect(tx7).to.equal(true);

            // away was favored 7 to -7 and the game ended 43 to 50
            const tx8 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(1),
                BigInt(43),
                BigInt(50)
            );
            await expect(tx8).to.equal(true);

            // away was unfavored -7 to 7 and the game ended 49 to 50 (underdog away won)
            const tx9 = await betting.checkIfWinnerBet(
                BigInt(7),
                BigInt(1),
                BigInt(50),
                BigInt(49)
            );
            await expect(tx9).to.equal(true);

            // away was favored 7 to -7 and the game ended 50 to 50 (tie)
            const tx10 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(1),
                BigInt(50),
                BigInt(50)
            );
            await expect(tx10).to.equal(false);

            // away was favored 7 to -7 and the game ended 44 to 50 (away won but not by enough)
            const tx11 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(1),
                BigInt(44),
                BigInt(50)
            );
            await expect(tx11).to.equal(false);

            // away was favored 7 to -7 and the game ended 51 to 50 (away lost)
            const tx12 = await betting.checkIfWinnerBet(
                BigInt(-7),
                BigInt(1),
                BigInt(51),
                BigInt(50)
            );
            await expect(tx12).to.equal(false);
        });
    });

    describe('Betting Process', function () {
        it('should allow anyone to start the betting process', async () => {
            const { betting, bettingWithPlayer1, player1, MIN_PAYMENT, MIN_BET, gameIds } =
                await loadFixture(deployFixture);
            await bettingWithPlayer1.startBetProcess(gameIds[0], BigInt(0), {
                value: MIN_PAYMENT,
            });

            const bets = await betting.getBets();
            const playerBet = bets.find((bet) => {
                return bet.player === player1.address;
            });

            expect(playerBet).to.exist;
            expect(playerBet?.player).to.equal(player1.address);
            expect(playerBet?.betId).to.equal(1);
            expect(playerBet?.status).to.equal(0);
            expect(playerBet?.gameId).to.equal(gameIds[0]);
            expect(playerBet?.gameDatafeedIds);
        });

        it('should revert if fees are forgotten (basically not enough payment is provided)', async () => {
            const { bettingWithPlayer1, MIN_BET, gameIds } = await loadFixture(deployFixture);
            await expect(
                bettingWithPlayer1.startBetProcess(gameIds[0], BigInt(0), {
                    value: MIN_BET,
                })
            ).to.be.revertedWith(
                'Insufficient funds, you need to provide enough funds to cover the oracle fee, contract fee and the bet amount'
            );
        });
        it('if game has not started it should be possible to finalize the bet', async () => {
            const {
                betting,
                player1,
                bettingWithPlayer1,
                connectedMock,
                MIN_PAYMENT,
                gameIds,
                mockMorpheus,
            } = await loadFixture(deployFixture);
            await bettingWithPlayer1.startBetProcess(gameIds[0], BigInt(0), {
                from: player1,
                value: MIN_PAYMENT,
            });

            const finalizeTransaction = await bettingWithPlayer1.finalizeBetProcess(BigInt(1), {
                from: player1,
            });

            const bets = await betting.getBets();
            const playerBet = bets.find((bet) => {
                return bet.player === player1.address;
            });
            expect(playerBet?.status).to.equal(1);
            expect(playerBet?.commenceTime).to.not.equal(0);
            expect(playerBet?.odd).to.not.equal(0);
        });
        it('if game has started it should not be possible to finalize the bet', async () => {
            const { betting, player1, bettingWithPlayer1, MIN_PAYMENT, gameIds, mockMorpheus } =
                await loadFixture(deployFixture);

            // second game feed has already started
            await bettingWithPlayer1.startBetProcess(gameIds[1], BigInt(0), {
                from: player1,
                value: MIN_PAYMENT,
            });
            let bets = await betting.getBets();
            const finalizeTransaction = await bettingWithPlayer1.finalizeBetProcess(BigInt(1), {
                from: player1,
            });
            bets = await betting.getBets();
            expect(bets.length).to.equal(0);
        });

        it('if game is finished I should be able to check results', async () => {
            const { betting, player1, bettingWithPlayer1, MIN_PAYMENT, gameIds, mockMorpheus } =
                await loadFixture(deployFixture);
            await bettingWithPlayer1.startBetProcess(gameIds[0], BigInt(0), {
                from: player1,
                value: MIN_PAYMENT,
            });
            await bettingWithPlayer1.finalizeBetProcess(BigInt(1), {
                from: player1,
            });

            await bettingWithPlayer1.checkGameResult(gameIds[0]);
            const tx = await bettingWithPlayer1.distribute(gameIds[0]);
            const bets = await betting.getBets();
            expect(bets.length).to.equal(0);
            // check if in tx contract transfered ether to player1
        });
    });
});
