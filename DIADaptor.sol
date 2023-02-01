pragma solidity 0.8.7;
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

interface IDIA {
    function getValue(string calldata key) external view returns (uint128, uint128);
}

contract DIADaptor is Ownable {
using SafeMath for uint256;

    address public DIA;
    mapping (address => string) public Tickers;
    mapping (address => bool) public excluded;
    mapping (address => uint256) public excludedPrices;


    constructor(address _DIA) public {
        DIA = _DIA;
    }

    function getUnderlyingPrice(address cToken) external view returns (uint256) {
        uint256 converted;
        string memory toCheck = Tickers[cToken];
        (uint256 DIAPrice,) = IDIA(DIA).getValue(toCheck);
        //convert the returned DIA number
        if (excluded[cToken]) {
            converted = excludedPrices[cToken];
        } else {
            converted = DIAPrice.mul(1e10);
        }
        
        return converted;
    }

    function setExcluded(address _underlying, uint256 _price) public onlyOwner {
       excludedPrices[_underlying] = _price;
       excluded[_underlying] = true;
    }

    function removeExcluded(address _underlying) public onlyOwner {
       excluded[_underlying] = false;
    }

    function addTicker(address _underlying, string memory ticker) public onlyOwner {
       Tickers[_underlying] = ticker;
    }

    function changeDIA(address _DIA) public onlyOwner {
        DIA = _DIA;
    }

}
