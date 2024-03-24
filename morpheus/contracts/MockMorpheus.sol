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

contract MockMorpheus is Morpheus {
    uint256 public _feedID = 1;
    uint8 public numerator = 10;
    uint8 public denominator = 1;

    function encodeValues(
        uint8 _numerator,
        uint8 _denominator,
        uint32 _commenceTime
    ) private pure returns (uint256 encoded) {
        return
            (uint256(_numerator) << 8) |
            (uint256(_denominator) << 16) |
            (uint256(_commenceTime) << 32);
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
        uint32 commenceTime = uint32(block.timestamp) + 1 days;
        return (encodeValues(numerator, denominator, commenceTime), 0, 0, "0");
    }

    function requestFeeds(
        string[] calldata APIendpoint,
        string[] calldata APIendpointPath,
        uint256[] calldata decimals,
        uint256[] calldata bounties
    ) external payable returns (uint256[] memory feeds) {
        uint256[] memory feedID = new uint256[](1);
        feedID[0] = _feedID;
        return feedID;
    }

    function getOdd() public view returns (string memory) {
        string memory numeratorStr = Strings.toString(numerator);
        string memory denominatorStr = Strings.toString(denominator);
        string memory oddStr = string(
            abi.encodePacked(numeratorStr, ":", denominatorStr)
        );
        return oddStr;
    }
}
