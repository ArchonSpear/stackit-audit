pragma solidity 0.8.7;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

contract ReferralFeesAggregatorV3 is ReentrancyGuardUpgradeable, OwnableUpgradeable {
    using SafeMath for uint256;

    mapping(address => mapping(address => uint256)) private userAmountsPerAssets;
    mapping(address => address[]) public userAssets;
    mapping(address => bool) public userAssetsExist;
    mapping(address => bool) public senderAllowed;
    uint256 public tester;

    mapping(address => mapping(address => bool)) public userAssetsExisting;

    function initialize() public initializer {
        __Ownable_init();
    }

    function setSenderAllowed(address _addressAllowed, bool _status) public onlyOwner {
        senderAllowed[_addressAllowed] = _status;
    }

    function getuserAssetAmount(address _user, address _asset) public view returns (uint256) {
        return userAmountsPerAssets[_user][_asset];
    }

    function getUserAssets(address _user) public view returns (address[] memory) {
        return userAssets[_user];
    }
    
    function addAmountToUser(uint256 _amount, address _asset, address _user) public {
        require(senderAllowed[msg.sender] == true, "Not allowed");
        if (userAssetsExisting[_user][_asset] == false) {
            userAssets[_user].push(_asset);
            userAssetsExisting[_user][_asset] = true;
        }
        userAmountsPerAssets[_user][_asset] =  userAmountsPerAssets[_user][_asset].add(_amount);
    }


}