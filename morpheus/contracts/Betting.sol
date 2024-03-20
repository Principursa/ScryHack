// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

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

contract Betting {
    int version = 2;
    Morpheus public morpheus;
    uint oracleFee = 100000000000000; // 0.0001 ETH
    uint256[] IDs;
    string endPoint = "http://localhost:3000";

    constructor(address oracleAddress) {
        morpheus = Morpheus(oracleAddress);
    }

    function getIDs() public view returns (uint256[] memory) {
        return IDs;
    }

    function getFeed(
        uint256 feedID
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
        return morpheus.getFeed(feedID);
    }

    function request() public payable {
        string[] memory apiEndpoint = new string[](1);
        apiEndpoint[0] = endPoint;

        // path to the object within the api response
        string[] memory apiEndpointPath = new string[](1);
        apiEndpointPath[0] = "";

        // This is the number of decimals that you want to use for the API response. You need to pass it as an array of uint256 values.
        uint256[] memory decimals = new uint256[](1);
        decimals[0] = 0;

        // This is the bounty amount that you want to pay for the API request. You need to pass it as an array of uint256 values
        uint256[] memory bounties = new uint256[](1);
        bounties[0] = oracleFee;
        IDs = morpheus.requestFeeds{value: oracleFee}(
            apiEndpoint,
            apiEndpointPath,
            decimals,
            bounties
        );
    }
}
