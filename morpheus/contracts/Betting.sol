// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

interface Morpheus {
    function getFeed(
        uint256 feedID
    )
        external
        view
        returns (
            uint256 value,
            uint256 decimals,
            uint256 timestamp,
            string memory valStr
        );

    function requestFeeds(
        string[] calldata APIendpoint,
        string[] calldata APIendpointPath,
        uint256[] calldata decimals,
        uint256[] calldata bounties
    ) external payable returns (uint256[] memory feeds);
}

enum BetStatus {
    PENDING,
    ACTIVE,
    WON,
    LOST
}

enum Team {
    HOME,
    AWAY
}

struct Bet {
    string gameId;
    uint256 betId;
    uint256 commenceTime;
    Team winningTeam;
    address player;
    int256 odd;
    uint256[] gameDatafeedIds;
    uint256 createdAt;
    uint256 updatedAt;
    BetStatus status;
}

contract Betting {
    int version = 8;
    Morpheus public morpheus;
    //100000000000000 wei
    uint oracleFee = 0.0001 ether;
    uint contractFee = 0.0001 ether;
    uint256 private betAmounts = 0.1 ether; // 0.1 ETH
    string apiEndpoint = "https://eventbuddy.snake-py.com/oracle";
    string gameDetailUri = "/game/";
    string gameResultUri = "/game-result/";
    uint256 decimal = 0;
    uint256 bountie = oracleFee;

    uint256 nextId = 1;

    Bet[] bets;

    mapping(string => uint256[]) gameResults;

    address ownerAddress;

    constructor(address _morpheus) {
        morpheus = Morpheus(_morpheus);
        ownerAddress = msg.sender;
    }

    function getVersion() public view returns (int) {
        return version;
    }

    modifier owner() {
        require(msg.sender == ownerAddress, "You are not the owner");
        _;
    }

    function startBetProcess(
        string memory gameId,
        Team winningTeam
    ) public payable {
        uint256 toalFees = oracleFee +
            oracleFee +
            oracleFee +
            oracleFee +
            contractFee +
            betAmounts;
        require(
            msg.value >= toalFees,
            "Insufficient funds, you need to provide enough funds to cover the oracle fee, contract fee and the bet amount"
        );

        Bet memory newBet = Bet({
            gameId: gameId,
            winningTeam: winningTeam,
            betId: nextId,
            gameDatafeedIds: new uint256[](2),
            player: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            commenceTime: 0,
            odd: 1000000,
            status: BetStatus.PENDING
        });

        nextId++;

        uint256[] memory gameDatafeedIds = requestGameData(gameId);
        newBet.gameDatafeedIds = gameDatafeedIds;
        bets.push(newBet);
    }

    function finalizeBetProcess(uint256 betId) public {
        Bet memory bet = getBetById(betId);

        require(
            bet.status == BetStatus.PENDING,
            "You can only finalize a bet that is pending"
        );

        require(
            block.timestamp - bet.createdAt <= 3600,
            "You can only finalize a bet that is not older than 1 hour"
        );

        require(
            msg.sender == bet.player,
            "You can only finalize a bet that you placed"
        );

        (uint256 odds, , , string memory valueStr) = getFeed(
            bet.gameDatafeedIds[0]
        );
        console.log("odds", odds);
        (uint256 commenceTime, , , ) = getFeed(bet.gameDatafeedIds[1]);

        // game has already started
        if (commenceTime < block.timestamp) {
            bet.updatedAt = block.timestamp;
            setBets(excludeBetById(bet.betId));
            payable(bet.player).transfer(betAmounts);
            return;
        }

        if (Strings.equal(valueStr, "negative")) {
            bet.odd = int256(odds);
        } else {
            bet.odd = -int256(odds);
        }
        bet.status = BetStatus.ACTIVE;
        bet.updatedAt = block.timestamp;
        bet.commenceTime = commenceTime;
        setBets(excludeBetById(bet.betId));
        bets.push(bet);
    }

    function excludeBetById(
        uint256 excludeBetId
    ) public view returns (Bet[] memory) {
        // First, count the bets to exclude
        uint256 count = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].betId != excludeBetId) {
                count++;
            }
        }

        // Allocate memory array with the exact size needed
        Bet[] memory remainingBets = new Bet[](count);

        // Populate the new array
        uint256 j = 0; // Index for the new array
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].betId != excludeBetId) {
                remainingBets[j] = bets[i];
                j++;
            }
        }
        return remainingBets;
    }

    function getBetById(uint256 betId) public view returns (Bet memory) {
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].betId == betId) {
                return bets[i];
            }
        }
        revert("Bet not found");
    }

    function checkGameResult(string memory gameId) public {
        Bet[] memory betsForGame = getBetsByGameId(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        uint256[] memory gameResultfeedIds = requestGameResult(gameId);
        gameResults[gameId] = gameResultfeedIds;
    }

    function distribute(string memory gameId) public {
        require(
            gameResults[gameId].length > 0,
            "You need to check the game result first"
        );

        (
            Bet[] memory betsForGame,
            Bet[] memory remainingBets
        ) = getBetsByGameIdAndRemainingBets(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        (uint256 homeScore, , , ) = getFeed(gameResults[gameId][0]);
        (uint256 awayScore, , , ) = getFeed(gameResults[gameId][1]);
        uint256 winnerCount = 0;

        // First pass: count winners to allocate memory correctly
        for (uint256 i = 0; i < betsForGame.length; i++) {
            Bet memory bet = betsForGame[i];
            if (
                checkIfWinnerBet(bet.odd, bet.winningTeam, homeScore, awayScore)
            ) {
                winnerCount++;
            }
        }

        // Allocate memory for winnerBets with the exact count
        Bet[] memory winnerBets = new Bet[](winnerCount);

        uint256 winnerIndex = 0; // Index for winnerBets array

        // Second pass: populate winnerBets and update bet statuses
        for (uint256 i = 0; i < betsForGame.length; i++) {
            Bet memory bet = betsForGame[i];
            if (
                checkIfWinnerBet(
                    bet.odd,
                    bet.winningTeam,
                    homeScore,
                    awayScore
                ) && bet.status == BetStatus.ACTIVE
            ) {
                bet.status = BetStatus.WON;
                winnerBets[winnerIndex] = bet;
                winnerIndex++;
            } else {
                bet.status = BetStatus.LOST;
            }
        }

        if (winnerBets.length == 0) {
            return;
        }

        uint256 amountToDistribute = (betAmounts * betsForGame.length) /
            winnerBets.length;

        // Distribute the amounts to the winners
        for (uint256 i = 0; i < winnerBets.length; i++) {
            payable(winnerBets[i].player).transfer(amountToDistribute);
        }

        // Assume setBets is correctly implemented to update the contract's state
        setBets(remainingBets);
    }

    function checkIfWinnerBet(
        int256 homeOdd,
        Team bettedTeam,
        uint256 homeScore,
        uint256 awayScore
    ) public pure returns (bool) {
        bool homeIsFavoured = homeOdd > 0;
        int256 home_spread_odd = homeOdd;
        int256 away_spread_odd = -homeOdd;

        // check if underdog simply won
        if (bettedTeam == Team.HOME && !homeIsFavoured) {
            if (homeScore > awayScore) {
                return true;
            }
        } else if (bettedTeam == Team.HOME && homeIsFavoured) {
            if (awayScore > homeScore) {
                return false;
            }
        } else if (bettedTeam == Team.AWAY && homeIsFavoured) {
            if (awayScore > homeScore) {
                return true;
            }
        } else if (bettedTeam == Team.AWAY && !homeIsFavoured) {
            if (homeScore > awayScore) {
                return false;
            }
        }

        // check point spread
        if (bettedTeam == Team.HOME) {
            if (homeIsFavoured) {
                // the home_spread_odd is positive the team home team needs to win by more than the spread
                return homeScore - awayScore >= uint256(home_spread_odd);
            } else {
                // the home_spread_odd is negative the team home team needs to loose by less than the spread
                return awayScore - homeScore <= uint256(away_spread_odd);
            }
        } else if (bettedTeam == Team.AWAY) {
            if (!homeIsFavoured) {
                // the away_spread_odd is positive the team away team needs to win by more than the spread
                return awayScore - homeScore >= uint256(away_spread_odd);
            } else {
                // the away_spread_odd is negative the team away team needs to loose by less than the spread
                return homeScore - awayScore <= uint256(home_spread_odd);
            }
        }
        return false;
    }

    // Utility Functions

    function setBets(Bet[] memory newBets) public {
        // Clear the existing array
        delete bets;

        // Manually copy each element
        for (uint i = 0; i < newBets.length; i++) {
            bets.push(newBets[i]);
        }
    }

    function getBets() public view returns (Bet[] memory) {
        return bets;
    }

    function getMyBets() public view returns (Bet[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].player == msg.sender) {
                count++;
            }
        }

        Bet[] memory myBets = new Bet[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].player == msg.sender) {
                myBets[index] = bets[i];
                index++;
            }
        }

        return myBets;
    }

    // Helper function to count bets by gameId
    function countBetsByGameId(
        string memory gameId
    ) private view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (Strings.equal(bets[i].gameId, gameId)) {
                count++;
            }
        }
        return count;
    }

    // Function to get bets by gameId
    function getBetsByGameId(
        string memory gameId
    ) public view returns (Bet[] memory) {
        uint256 gameBetsCount = countBetsByGameId(gameId);
        Bet[] memory gameBets = new Bet[](gameBetsCount);
        uint256 j = 0; // Use an independent counter for indexing gameBets
        for (uint256 i = 0; i < bets.length; i++) {
            if (Strings.equal(bets[i].gameId, gameId)) {
                gameBets[j] = bets[i];
                j++;
            }
        }
        return gameBets;
    }

    function getBetsByGameIdAndRemainingBets(
        string memory gameId
    ) public view returns (Bet[] memory, Bet[] memory) {
        // First, count the number of bets for each category
        uint256 gameBetsCount = 0;
        uint256 remainingBetsCount = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (Strings.equal(bets[i].gameId, gameId)) {
                gameBetsCount++;
            } else {
                remainingBetsCount++;
            }
        }

        // Now, allocate memory arrays with the correct sizes
        Bet[] memory gameBets = new Bet[](gameBetsCount);
        Bet[] memory remainingBets = new Bet[](remainingBetsCount);

        // Reset counters to use them for indexing in the next loop
        gameBetsCount = 0;
        remainingBetsCount = 0;

        // Populate the arrays
        for (uint256 i = 0; i < bets.length; i++) {
            if (Strings.equal(bets[i].gameId, gameId)) {
                gameBets[gameBetsCount] = bets[i];
                gameBetsCount++;
            } else {
                remainingBets[remainingBetsCount] = bets[i];
                remainingBetsCount++;
            }
        }

        return (gameBets, remainingBets);
    }

    function decodeValues(
        uint256 encoded
    ) public pure returns (uint256, uint256, uint256) {
        uint256 commenceTime = encoded >> 32;
        uint256 denominator = (encoded >> 16) & 0xff;
        uint256 numerator = (encoded >> 8) & 0xff;

        return (numerator, denominator, commenceTime);
    }

    function requestGameData(
        string memory gameId
    ) private returns (uint256[] memory) {
        string[] memory endPoint = new string[](2);
        string memory _endPoint = buildGameDataUrl(
            apiEndpoint,
            gameDetailUri,
            gameId
        );
        console.log("endPoint", _endPoint);
        endPoint[0] = _endPoint;
        endPoint[1] = _endPoint;

        string[] memory path = new string[](2);
        path[0] = "home_points";
        path[1] = "commence_time";

        uint256[] memory decimals = new uint256[](2);
        decimals[0] = decimal;
        decimals[1] = decimal;

        uint256[] memory bounties = new uint256[](2);
        bounties[0] = bountie;
        bounties[1] = bountie;

        return
            morpheus.requestFeeds{value: oracleFee + oracleFee}(
                endPoint,
                path,
                decimals,
                bounties
            );
    }

    function requestGameResult(
        string memory gameId
    ) private returns (uint256[] memory) {
        string[] memory endPoint = new string[](2);
        string memory uri = buildGameDataUrl(
            apiEndpoint,
            gameResultUri,
            gameId
        );
        endPoint[0] = uri;
        endPoint[1] = uri;

        string[] memory path = new string[](2);
        path[0] = "home_score";
        path[1] = "away_score";

        uint256[] memory decimals = new uint256[](2);
        decimals[0] = decimal;
        decimals[1] = decimal;

        uint256[] memory bounties = new uint256[](2);
        bounties[0] = bountie;
        bounties[1] = bountie;

        uint256[] memory ids = morpheus.requestFeeds{
            value: oracleFee + oracleFee
        }(endPoint, path, decimals, bounties);

        return ids;
    }

    function buildGameDataUrl(
        string memory endPoint,
        string memory uri,
        string memory gameId
    ) public pure returns (string memory) {
        string memory fullEndPoint = string(
            abi.encodePacked(endPoint, uri, gameId)
        );
        return fullEndPoint;
    }

    function getFeed(
        uint256 gamefeedID
    )
        public
        view
        returns (
            uint256 _value,
            uint256 _decimals,
            uint256 _timestamp,
            string memory _valStr
        )
    {
        return morpheus.getFeed(gamefeedID);
    }

    // Owner Functions

    function setEndPoint(
        string memory _endPoint,
        string memory _gameDetailsUri,
        string memory _gameResultUri
    ) public owner {
        apiEndpoint = _endPoint;
        gameDetailUri = _gameDetailsUri;
        gameResultUri = _gameResultUri;
    }

    function setOracleFee(uint256 _oracleFee) public owner {
        oracleFee = _oracleFee;
    }

    function setContractFee(uint256 _contractFee) public owner {
        contractFee = _contractFee;
    }

    function getEndPoint() public view owner returns (string memory) {
        return (apiEndpoint);
    }
}
