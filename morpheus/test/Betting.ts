import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

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

describe('Betting', function async() {
    async function deployFixture() {
        const [owner, player1, player2] = await hre.ethers.getSigners();
        const MIN_BET = hre.ethers.parseEther('0.1');
        const ORACLE_FEE = hre.ethers.parseEther('0.001');
        const CONTRACT_FEE = hre.ethers.parseEther('0.001');

        const MIN_PAYMENT = hre.ethers.parseEther('0.1002');

        const MockMorpheus = await hre.ethers.getContractFactory('MockMorpheus');
        const mockMorpheus = await MockMorpheus.deploy({ from: owner.address });
        const address = mockMorpheus.getAddress();

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
            const gameId = BigInt(1);
            const endPoints = 'https://api.sportmonks.com/some-endpoint';
            const url = await betting.buildGameDataUrl(endPoints, gameId);
            await expect(url).equals('https://api.sportmonks.com/some-endpoint?gameId=1');
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
    });

    describe('Betting Process', function () {
        it('should allow anyone to start the betting process', async () => {
            const { betting, bettingWithPlayer1, player1, MIN_PAYMENT, MIN_BET } =
                await loadFixture(deployFixture);
            const betTransaction = await bettingWithPlayer1.startBetProcess(BigInt(1), {
                from: player1,
                value: MIN_PAYMENT,
            });

            const bets = await betting.getBets();
            const playerBet = bets.find((bet) => {
                return bet.player === player1.address;
            });

            expect(playerBet).to.exist;
            expect(playerBet?.player).to.equal(player1.address);
            expect(playerBet?.amount).to.equal(MIN_BET);
            expect(playerBet?.betId).to.equal(1);
            expect(playerBet?.status).to.equal(0);
            expect(playerBet?.gameId).to.equal(1);
            expect(playerBet?.feedId).to.equal(1);
        });

        it('should revert if fees are forgotten (basically not enough payment is provided)', async () => {
            const { bettingWithPlayer1, MIN_BET } = await loadFixture(deployFixture);
            await expect(
                bettingWithPlayer1.startBetProcess(BigInt(1), {
                    value: MIN_BET,
                })
            ).to.be.revertedWith(
                'Insufficient funds, you need to provide enough funds to cover the oracle fee, contract fee and the bet amount'
            );
        });

        it('if game has not started it should be possible to finalize the bet', async () => {
            const { betting, player1, bettingWithPlayer1, MIN_PAYMENT, MIN_BET, mockMorpheus } =
                await loadFixture(deployFixture);
            await bettingWithPlayer1.startBetProcess(BigInt(1), {
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
            const odd = await mockMorpheus.getOdd();
            expect(playerBet?.odd).to.equal(odd);
        });
    });
});
