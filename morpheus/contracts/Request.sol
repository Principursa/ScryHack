// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
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

contract Request {
    uint256[] IDs;

    string[] APIendpoint = [
        "https://api.exchange.coinbase.com/products/ETH-USD/stats/",
        "https://api.exchange.coinbase.com/products/ETH-USD/stats/"
    ];
    string[] APIendpointPath = ["last", "open"];
    uint256[] decimals = [2, 2];
    uint256 oracleFee = 0.0001 ether;

    Morpheus public morpheus;

    constructor(address _morpheus) {
        morpheus = Morpheus(_morpheus);
    }

    function requestFeeds() external payable {
        uint256 length = APIendpoint.length;
        uint256 totalRequiredFees = oracleFee * length;

        require(msg.value >= totalRequiredFees, "Request: Insufficient fees");
        require(
            length == APIendpointPath.length && length == decimals.length,
            "Request: Invalid request parameters length"
        );

        uint256[] memory bounties = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            bounties[i] = oracleFee;
        }

        IDs = morpheus.requestFeeds{value: totalRequiredFees}(
            APIendpoint,
            APIendpointPath,
            decimals,
            bounties
        );
    }

    function getFeed(
        uint256 feedID
    )
        external
        view
        returns (
            uint256 _value,
            uint256 _decimals,
            uint256 _timestamp,
            string memory _valStr
        )
    {
        return morpheus.getFeed(feedID);
    }

    function setRequestParameters(
        string[] memory _APIendpoint,
        string[] memory _APIendpointPath,
        uint256[] memory _decimals,
        uint256[] memory _bounties
    ) external {
        APIendpoint = _APIendpoint;
        APIendpointPath = _APIendpointPath;
        decimals = _decimals;
    }

    function getIDs() external view returns (uint256[] memory) {
        return IDs;
    }

    function getRequestParams()
        external
        view
        returns (string[] memory, string[] memory, uint256[] memory)
    {
        return (APIendpoint, APIendpointPath, decimals);
    }
}
