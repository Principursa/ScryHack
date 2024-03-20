pragma solidity ^0.8.0;

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
    Morpheus public morpheus;
    uint oracleFee = 100000000000000;
    uint nID;
    string endPoint =
        "https://api.the-odds-api.com/v4/sports/basketball_nba/odds?regions=us&oddsFormat=american&apiKey=43145865a7fde566bbe6c18da6aeb40d";

    constructor() {
        // constructor(address oracleAddress) {
        morpheus = Morpheus(0x0000000000071821e8033345A7Be174647bE0706);
    }

    function request() external returns (uint256[] memory feeds) {
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
        feeds = morpheus.requestFeeds{value: oracleFee}(
            apiEndpoint,
            apiEndpointPath,
            decimals,
            bounties
        );
        return feeds;
    }
}
