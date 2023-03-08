pragma solidity 0.8.7;

interface IVault {
    function depositAll() external;
    function withdrawAll() external;
    function deposit(uint256 _amounts) external;
    function withdraw(uint256 _amounts) external;
    function getPricePerFullShare() external view returns (uint256);
    function balanceOf(address _address) external returns (uint256);
}