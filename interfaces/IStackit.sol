pragma solidity 0.8.7;

interface IStackit {
    function getStreamStats(uint256 _index) external view returns(
        uint256 amount,
        uint256 totalAmount,
        uint256 buyWithSwapped,
        uint256 toBuyReceived,
        uint256 shares);

    function getStreamDetails(uint256 _index) external view returns(
        uint256 interval,
        uint256 startTime,
        uint256 lastSwap,
        uint256 isactive,
        address buyWith,
        address toBuy,
        uint256 iteration);

    function getListOfStreams(address _user) external view returns (uint[] memory);
    function getAmountLeftInVault(uint256 _count) external view returns (uint256);
    function isMultipleStream(uint256 _count) external view returns (bool);
    function getStreamBasketOfAssets(uint256 _count) external view returns (address[] memory);
    function getAssetsAggregate(uint256 _count) external view returns (address[] memory);
    function getMultipleAmountForStream(uint256 count, address _asset) external view returns (uint256);
    function getUserAmountInStream(uint256 count, address user) external view returns (uint256);
}
