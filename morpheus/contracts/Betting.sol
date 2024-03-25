// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Strings.sol";

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
    NOT_ACCEPTED,
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
    uint oracleFee = 0.0001 ether;
    uint contractFee = 0.0001 ether;
    uint256 private betAmounts = 0.1 ether; // 0.1 ETH
    string apiEndpoint = "http://api.test.com/game";
    uint256 decimal = 0;
    uint256 bountie = oracleFee;

    uint256 nextId = 1;

    Bet[] bets;

    mapping(string => uint256) gameResults;

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
        uint256 toalFees = oracleFee + oracleFee + contractFee + betAmounts;
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
        Bet storage bet = bets[betId - 1];

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
        (uint256 commenceTime, , , ) = getFeed(bet.gameDatafeedIds[1]);

        // game has already started
        if (commenceTime < block.timestamp) {
            bet.status = BetStatus.NOT_ACCEPTED;
            bet.updatedAt = block.timestamp;
            bet.commenceTime = commenceTime;
            // need to revert the bet amount
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
    }

    function checkGameResult(string memory gameId) public {
        Bet[] memory betsForGame = getBetsByGameId(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        uint256 gameResultfeedId = requestGameResult(gameId);
        gameResults[gameId] = gameResultfeedId;
    }

    function distribute(string memory gameId) public {
        require(
            gameResults[gameId] != 0,
            "You need to check the game result first"
        );

        (
            Bet[] memory betsForGame,
            Bet[] memory remainingBets
        ) = getBetsByGameIdAndRemainingBets(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        (uint256 value, , , string memory valStr) = getFeed(
            gameResults[gameId]
        );
        // if my odds 6, this means the home team needs to win by 6 point
        bool isNegative = Strings.equal(valStr, "negative");
        int256 score = isNegative ? -int256(value) : int256(value);
        Team winningTeam = score > 0 ? Team.HOME : Team.AWAY;

        Bet[] memory winnerBets;

        for (uint256 i = 0; i < betsForGame.length; i++) {
            Bet memory bet = betsForGame[i];
            if (bet.winningTeam == winningTeam && bet.odd == score) {
                bet.status = BetStatus.WON;
                winnerBets[winnerBets.length] = bet;
            } else {
                bet.status = BetStatus.LOST;
            }
        }

        if (winnerBets.length == 0) {
            return;
        }

        uint256 amountToDistribute = (betAmounts * betsForGame.length) /
            winnerBets.length;

        for (uint256 i = 0; i < winnerBets.length; i++) {
            payable(winnerBets[i].player).transfer(amountToDistribute);
        }

        // remove the bets that are already distributed
        bets = remainingBets;
    }

    // Utility Functions

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

    function getBetsByGameId(
        string memory gameId
    ) public view returns (Bet[] memory) {
        Bet[] memory gameBets;
        for (uint256 i = 0; i < bets.length; i++) {
            if (Strings.equal(bets[i].gameId, gameId)) {
                gameBets[i] = bets[i];
            }
        }
        return gameBets;
    }

    function getBetsByGameIdAndRemainingBets(
        string memory gameId
    ) public view returns (Bet[] memory, Bet[] memory) {
        Bet[] memory gameBets;
        Bet[] memory remainingBets;
        uint256 gameBetsCount = 0;
        uint256 remainingBetsCount = 0;
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
            "/game",
            gameId
        );
        endPoint[0] = _endPoint;
        endPoint[1] = _endPoint;

        string[] memory path = new string[](2);
        path[0] = "odds";
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

    function requestGameResult(string memory gameId) private returns (uint256) {
        string[] memory endPoint = new string[](1);
        endPoint[0] = buildGameDataUrl(apiEndpoint, "/game", gameId);

        string[] memory path = new string[](1);
        path[0] = "result";

        uint256[] memory decimals = new uint256[](1);
        decimals[0] = decimal;

        uint256[] memory bounties = new uint256[](1);
        bounties[0] = bountie;

        uint256[] memory ids = morpheus.requestFeeds{value: oracleFee}(
            endPoint,
            path,
            decimals,
            bounties
        );

        return ids[0];
    }

    function buildGameDataUrl(
        string memory endPoint,
        string memory uri,
        string memory gameId
    ) public pure returns (string memory) {
        string memory fullEndPoint = string(
            abi.encodePacked(endPoint, uri, "?gameId=", gameId)
        );
        return fullEndPoint;
    }

    function getFeed(
        uint256 gamefeedID
    )
        private
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

    function setEndPoint(string memory _endPoint) public owner {
        apiEndpoint = _endPoint;
    }

    function getEndPoint() public view owner returns (string memory) {
        return (apiEndpoint);
    }
}
