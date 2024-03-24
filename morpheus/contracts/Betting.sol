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
    uint256 gameId;
    uint256 bet;
    uint256 betId;
    Team winningTeam;
    address player;
    string odd;
    uint256 amount;
    uint256 gamefeedId;
    uint256 gameResultfeedId;
    uint256 createdAt;
    uint256 updatedAt;
    uint256 commenceTime;
    BetStatus status;
}

contract Betting {
    int version = 7;
    Morpheus public morpheus;
    uint oracleFee = 0.0001 ether;
    uint contractFee = 0.0001 ether;
    uint256 private minBet = 0.1 ether; // 0.1 ETH
    string _gameDataEndPoint =
        "https://api.exchange.coinbase.com/products/ETH-USD/stats/";
    string _path = "result";
    string _gameResultDataEndPoint =
        "https://api.exchange.coinbase.com/products/ETH-USD/stats/";
    uint256 _decimals = 0;
    uint256 _bounties = oracleFee;

    Bet[] bets;

    mapping(uint256 => uint256) gameResults;

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
        uint256 gameId,
        Team winningTeam
    ) public payable returns (uint256 betId) {
        uint256 toalFees = oracleFee + contractFee + minBet;
        require(
            msg.value >= toalFees,
            "Insufficient funds, you need to provide enough funds to cover the oracle fee, contract fee and the bet amount"
        );

        uint256 bet = msg.value - oracleFee - contractFee;

        Bet memory newBet = Bet({
            gameId: gameId,
            bet: bet,
            winningTeam: winningTeam,
            gameResultfeedId: 0,
            betId: bets.length + 1,
            player: msg.sender,
            amount: msg.value - oracleFee - contractFee,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            gamefeedId: 0,
            commenceTime: 0,
            odd: "0:0",
            status: BetStatus.PENDING
        });

        uint256 gamefeedId = requestGameData(gameId);
        newBet.gamefeedId = gamefeedId;
        bets.push(newBet);

        return newBet.betId;
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

        (uint256 value, , , ) = getFeed(bet.gamefeedId);

        (
            uint256 numerator,
            uint256 denominator,
            uint256 commenceTime
        ) = decodeValues(value);

        // game has already started
        if (commenceTime < block.timestamp) {
            bet.status = BetStatus.NOT_ACCEPTED;
            bet.updatedAt = block.timestamp;
            bet.commenceTime = commenceTime;
            // need to revert the bet amount
            payable(bet.player).transfer(bet.amount);
            return;
        }

        // save data into the bet
        bet.status = BetStatus.ACTIVE;
        bet.updatedAt = block.timestamp;
        bet.commenceTime = commenceTime;
        string memory numeratorStr = Strings.toString(numerator);
        string memory denominatorStr = Strings.toString(denominator);
        string memory oddStr = string(
            abi.encodePacked(numeratorStr, ":", denominatorStr)
        );
        bet.odd = oddStr;
        // consider making antoher request to set a timer for checking the game status
        return;
    }

    function checkGameResult(uint256 gameId) public {
        Bet[] memory betsForGame = getBetsByGameId(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        uint256 gameResultfeedId = requestGameResult(gameId);
        gameResults[gameId] = gameResultfeedId;
    }

    function distribute(uint256 gameId) public {
        require(
            gameResults[gameId] != 0,
            "You need to check the game result first"
        );

        Bet[] memory betsForGame = getBetsByGameId(gameId);

        if (betsForGame.length == 0) {
            return;
        }

        (uint256 value, , , string memory valStr) = getFeed(
            gameResults[gameId]
        );
        bool isNegative = Strings.equal(valStr, "negative");
        Team winningTeam = isNegative ? Team.AWAY : Team.HOME;

        Bet[] memory winnerBets;
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < betsForGame.length; i++) {
            Bet memory bet = betsForGame[i];
            if (bet.winningTeam == winningTeam) {
                bet.status = BetStatus.WON;
                winnerBets[winnerBets.length] = bet;
            } else {
                bet.status = BetStatus.LOST;
            }

            totalAmount += bet.amount;
        }

        if (winnerBets.length == 0) {
            return;
        }

        uint256 amountToDistribute = totalAmount / winnerBets.length;

        for (uint256 i = 0; i < winnerBets.length; i++) {
            payable(winnerBets[i].player).transfer(amountToDistribute);
        }
    }

    function getBetsByGameId(
        uint256 gameId
    ) public view returns (Bet[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].gameId == gameId) {
                count++;
            }
        }

        Bet[] memory gameBets = new Bet[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].gameId == gameId) {
                gameBets[index] = bets[i];
                index++;
            }
        }

        return gameBets;
    }

    function decodeValues(
        uint256 encoded
    ) public pure returns (uint256, uint256, uint256) {
        uint256 commenceTime = encoded >> 32;
        uint256 denominator = (encoded >> 16) & 0xff;
        uint256 numerator = (encoded >> 8) & 0xff;

        return (numerator, denominator, commenceTime);
    }

    function requestGameData(uint256 gameId) private returns (uint256) {
        string[] memory endPoint = new string[](1);
        endPoint[0] = buildGameDataUrl(_gameDataEndPoint, gameId);
        string[] memory path = new string[](1);
        path[0] = _path;
        endPoint[0] = buildGameDataUrl(_gameDataEndPoint, gameId);
        uint256[] memory decimals = new uint256[](1);
        decimals[0] = _decimals;
        uint256[] memory bounties = new uint256[](1);
        bounties[0] = _bounties;

        uint256[] memory ids = morpheus.requestFeeds{value: oracleFee}(
            endPoint,
            path,
            decimals,
            bounties
        );

        return ids[0];
    }

    function requestGameResult(uint256 gameId) private returns (uint256) {
        string[] memory endPoint = new string[](1);
        endPoint[0] = buildGameDataUrl(_gameResultDataEndPoint, gameId);
        string[] memory path = new string[](1);
        path[0] = _path;
        uint256[] memory decimals = new uint256[](1);
        decimals[0] = _decimals;
        uint256[] memory bounties = new uint256[](1);
        bounties[0] = _bounties;

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
        uint256 gameId
    ) public pure returns (string memory) {
        string memory gameIdString = Strings.toString(gameId);
        string memory fullEndPoint = string(
            abi.encodePacked(endPoint, "?gameId=", gameIdString)
        );
        return fullEndPoint;
    }

    function setEndPoint(
        string memory endPoint,
        string memory path,
        uint256 decimals
    ) public owner {
        _gameDataEndPoint = endPoint;
        _path = path;
        _gameDataEndPoint = endPoint;
        _decimals = decimals;
        _bounties = oracleFee;
    }

    function getEndPoint()
        public
        view
        returns (string memory, string memory, uint256, uint256)
    {
        return (_gameDataEndPoint, _path, _decimals, _bounties);
    }

    function getFeed(
        uint256 gamefeedID
    )
        public
        view
        returns (
            uint256 value,
            uint256 decimals,
            uint256 timestamp,
            string memory valStr
        )
    {
        return morpheus.getFeed(gamefeedID);
    }
}
