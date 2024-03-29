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

struct MockGameData {
    int256 home_points;
    int256 commence_time;
}

struct MockGameResultData {
    uint256 home_score;
    uint256 away_score;
}

contract MockMorpheus is Morpheus {
    uint8 public numerator = 10;
    uint8 public denominator = 1;
    uint8 public index = 0;

    int256[] public feedData;

    mapping(string => MockGameData) mockGameData;
    mapping(string => MockGameResultData) mockGameResultData;

    string apiEndpoint = "http://45.83.107.70/oracle";
    string gameDetailUri = "/game/";
    string gameResultUri = "/game-result/";

    constructor(
        string[] memory gameIDs,
        int256[] memory homeSpreadPoints,
        int256[] memory commenceTimes,
        uint256[] memory homeScore,
        uint256[] memory awayScore
    ) {
        require(
            gameIDs.length == homeSpreadPoints.length &&
                gameIDs.length == commenceTimes.length &&
                gameIDs.length == homeScore.length &&
                gameIDs.length == awayScore.length,
            "Invalid input"
        );

        for (uint256 i = 0; i < homeSpreadPoints.length; i++) {
            string memory fullEndPoint = string(
                abi.encodePacked(apiEndpoint, gameDetailUri, gameIDs[i])
            );
            mockGameData[fullEndPoint] = MockGameData({
                home_points: homeSpreadPoints[i],
                commence_time: commenceTimes[i]
            });
        }

        for (uint256 i = 0; i < homeScore.length; i++) {
            uint256 resultHome = homeScore[i];
            uint256 resultAway = awayScore[i];
            string memory fullEndPoint = string(
                abi.encodePacked(apiEndpoint, gameResultUri, gameIDs[i])
            );
            mockGameResultData[fullEndPoint] = MockGameResultData({
                home_score: resultHome,
                away_score: resultAway
            });
        }
    }

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
        )
    {
        require(feedID < feedData.length, "Invalid feed ID");

        int256 feed = feedData[feedID];
        uint256 feedDecimals = 0;
        uint256 feedTimestamp = block.timestamp;
        string memory feedValStr = feed > 0 ? "" : "negative";

        return (uint256(feed), feedDecimals, feedTimestamp, feedValStr);
    }

    function requestFeeds(
        string[] calldata APIendpoint,
        string[] calldata APIendpointPath,
        uint256[] calldata decimals,
        uint256[] calldata bounties
    ) external payable returns (uint256[] memory feeds) {
        uint256 fees = 0;
        for (uint256 i = 0; i < bounties.length; i++) {
            fees += bounties[i];
        }
        require(msg.value >= fees, "Insufficient fees");

        if (!contains("result", APIendpoint[0])) {
            feedData.push(mockGameData[APIendpoint[0]].home_points);
            feedData.push(mockGameData[APIendpoint[0]].commence_time);

            feeds = new uint256[](2);
            feeds[0] = feedData.length - 2;
            feeds[1] = feedData.length - 1;
            return feeds;
        } else {
            feedData.push(
                int256(mockGameResultData[APIendpoint[0]].home_score)
            );
            feedData.push(
                int256(mockGameResultData[APIendpoint[0]].away_score)
            );

            feeds = new uint256[](2);
            feeds[0] = feedData.length - 1;
            feeds[1] = feedData.length - 1;
            return feeds;
        }
    }

    function contains(
        string memory what,
        string memory where
    ) public pure returns (bool) {
        bytes memory whatBytes = bytes(what);
        bytes memory whereBytes = bytes(where);

        require(whereBytes.length >= whatBytes.length);

        bool found = false;
        for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
            bool flag = true;
            for (uint j = 0; j < whatBytes.length; j++)
                if (whereBytes[i + j] != whatBytes[j]) {
                    flag = false;
                    break;
                }
            if (flag) {
                found = true;
                break;
            }
        }
        return found;
    }

    function getFeedData() public view returns (int256[] memory) {
        return feedData;
    }
}
