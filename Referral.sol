
pragma solidity 0.8.7;
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import './interfaces/IStackit.sol';
import "hardhat/console.sol";

interface IDIADaptor {
    function getUnderlyingPrice(address cToken) external view returns (uint256);
}

contract StackitReferral is OwnableUpgradeable, ReentrancyGuardUpgradeable {
using SafeMath for uint256;
    
    address public Stackit;
    uint256 public maxDiscountStep;
    uint256 public maxDiscount;
    uint256 public maxReferralStep;
    uint256 public maxReferral;
    uint256 public defaultReferralLink;
    address public DIADaptor;
    uint256 public tester;

    uint256[] public discountArray;
    uint256[] public referralArray;

    mapping(address => uint256[]) public userReferralList;
    mapping(address => uint256) public userReferralLink;
    mapping(address => bool) public userReferralStatus;
    mapping(uint256 => address) public referralLinkSecurity;
    mapping(address => uint256) public userReferredFrom;
    mapping(address => uint256) public assetMultiplier;
    mapping(address => bool) public isWhitelisted;
    mapping(uint256 => uint256) public discountPercentOnReferralCount;
    mapping(uint256 => uint256) public referralPercentOnReferralCount;
    mapping(address => uint256) public whitelistedDiscount;
    mapping(address => uint256) public whitelistedReferralFees;
    mapping(address => bool) public canChangeReferralLink;

    mapping(address => bool) public userInSharedStream;

    /**
     * Constructor.
    */
    function initialize(address _Stackit) public initializer {
        Stackit = _Stackit;
        userReferralLink[msg.sender] = block.number;
        referralLinkSecurity[block.number] = msg.sender;
        userReferralStatus[msg.sender] = true;
        userReferredFrom[msg.sender] = block.number;
        defaultReferralLink = block.number;
        __Ownable_init();
    }

    /**
     * Set function.
    */

    function setDefaultReferralLink(uint256 _defaultReferralLink) public onlyOwner {
        defaultReferralLink = _defaultReferralLink;
    }


    function isInSharedStream(address _user) public view returns (bool) {
        return userInSharedStream[_user];
    }   

    function setAssetMultiplier(address _asset, uint256 _assetMultiplier) public onlyOwner {
        require(_asset != address(0), "No 0 addresses ser");
        assetMultiplier[_asset] = _assetMultiplier;
    }

    function setWhitelistedAddress(
        address _toWhitelist,
        bool _status,
        uint256 _whitelistedDiscount,
        uint256 _whitelistedReferralFees) public onlyOwner {
        require(_toWhitelist != address(0), "No 0 addresses ser");
        isWhitelisted[_toWhitelist] = _status;
        whitelistedDiscount[_toWhitelist] = _whitelistedDiscount;
        whitelistedReferralFees[_toWhitelist] = _whitelistedReferralFees;
    }

    function setStackitAddress(address _Stackit) public onlyOwner {
        require(_Stackit != address(0), "No 0 addresses ser");
        Stackit = _Stackit;
    }

    function setDIADaptorAddress(address _DIADaptor) public onlyOwner {
        require(_DIADaptor != address(0), "No 0 addresses ser");
        DIADaptor = _DIADaptor;
    }

    //_maxDiscountStep has to be equal to the last value in the _step array
    function setReferralPercentOnReferralCount(uint256[] memory _step, uint256[] memory _referral, uint256 _maxReferralStep, uint256 _maxReferral) public onlyOwner {
        uint256 steplen = _step.length;
        uint256 referrallen = _referral.length;
        delete referralArray;
        require(steplen == referrallen, "Uneven repartition, please check ser");

        for (uint256 i = 0; i < steplen; i++) {
            referralPercentOnReferralCount[_step[i]] = _referral[i];
            referralArray.push(_step[i]);
        }
        maxReferralStep = _maxReferralStep;
        maxReferral = _maxReferral;
    }

    //_maxDiscountStep has to be equal to the last value in the _step array
    function setDiscountsPercentOnReferralCount(uint256[] memory _step, uint256[] memory _discount, uint256 _maxDiscountStep, uint256 _maxDiscount) public onlyOwner {
        uint256 steplen = _step.length;
        uint256 discountlen = _discount.length;
        delete discountArray;
        require(steplen == discountlen, "Uneven repartition, please check ser");

        for (uint256 i = 0; i < steplen; i++) {
            discountPercentOnReferralCount[_step[i]] = _discount[i];
            discountArray.push(_step[i]);
        }
        maxDiscountStep = _maxDiscountStep;
        maxDiscount = _maxDiscount;
    }

    function getAmountLeft(uint256 count) public view returns (uint256,uint256,uint256,uint256,uint256,uint256) {
        (,,,uint256 isActive,address buyWith,address toBuy,) = IStackit(Stackit).getStreamDetails(count);
        uint256 amountLeft = IStackit(Stackit).getAmountLeftInVault(count);
        uint256 collateralPrice = getCollateralPrice(buyWith);
        uint256 value = amountLeft.mul(assetMultiplier[buyWith]).mul(collateralPrice).div(1e18);

        (,,,,uint256 toBuyReceived) = IStackit(Stackit).getStreamStats(count);
        uint256 receivedPrice = getCollateralPrice(toBuy);
        uint256 tokensValue = toBuyReceived.mul(assetMultiplier[buyWith]).mul(receivedPrice).div(1e18);
        return (amountLeft,collateralPrice, value,toBuyReceived,receivedPrice,tokensValue);
    }

    /**
     * Getters.
    */
    // grab total received and currently staked
    function getUserTVL(address _user) public view returns (uint256) {
        uint256[] memory userStreams = IStackit(Stackit).getListOfStreams(_user);
        uint256 streamlen = userStreams.length;
        uint256 amountInStreams;
        for (uint256 i = 0; i < streamlen; i++) {
            (,,,uint256 isActive,address buyWith,address toBuy,) = IStackit(Stackit).getStreamDetails(userStreams[i]);
            
            if (isActive == 1 && IStackit(Stackit).isMultipleStream(i) == false) {
                uint256 userS = userStreams[i];
                (,,,,uint256 toBuyReceived) = IStackit(Stackit).getStreamStats(userS);
                //Oracle call to fetch the price
                uint256 tokensValue = toBuyReceived.mul(assetMultiplier[toBuy]).mul(getCollateralPrice(toBuy)).div(1e18);
                amountInStreams = amountInStreams.add(tokensValue);
                uint256 leftInVault = IStackit(Stackit).getAmountLeftInVault(userS).mul(assetMultiplier[buyWith]).mul(getCollateralPrice(buyWith)).div(1e18);
                amountInStreams = amountInStreams.add(leftInVault);
            } else if (isActive == 1 && IStackit(Stackit).isMultipleStream(i) == true) {
                address[] memory assets = IStackit(Stackit).getStreamBasketOfAssets(i);
                uint256 multiple = _getMultipleStreamTVL(assets,assets.length, i, buyWith);
                amountInStreams = amountInStreams.add(multiple);
            }
        }
        return amountInStreams;
    }

    function _getMultipleStreamTVL(address[] memory _assets, uint256 assetlen, uint256 currentCount, address _buyWith) internal view returns (uint256) {
        uint256 amountInStreams2;
        for (uint256 j = 0; j < assetlen; j++) {
            uint256 assetAmount = IStackit(Stackit).getMultipleAmountForStream(currentCount,_assets[j]);
            uint256 tokensValue = assetAmount.mul(assetMultiplier[_assets[j]]).mul(getCollateralPrice(_assets[j])).div(1e18);
            amountInStreams2 = amountInStreams2.add(tokensValue);
            uint256 leftInVault = IStackit(Stackit).getAmountLeftInVault(currentCount).mul(assetMultiplier[_buyWith]).mul(getCollateralPrice(_buyWith)).div(1e18);
            amountInStreams2 = amountInStreams2.add(leftInVault);
        }

        return amountInStreams2;
    }

    function isWhitelistedAddress(address _user) public view returns (bool) {
        return isWhitelisted[_user];
    }

    function getWasReferredFrom(address _user) public view returns (address) {
        return referralLinkSecurity[userReferredFrom[_user]];
    }

    function getDiscountForStep(uint256 _step) public view returns (uint256) {
        return discountPercentOnReferralCount[_step];
    }

    function getuserReferralList(address _user) public view returns (uint256[] memory) {
        return userReferralList[_user];
    }

    function getuserCount(address _user) public view returns (uint256) {
        return userReferralList[_user].length;
    }

    function isUserAbleToChangeLink(address _user) public view returns (bool) {
        return canChangeReferralLink[_user];
    }

    function isUserSignedUp(address _user) public view returns (bool) {
        return userReferralStatus[_user];
    }

    function getMaxDiscountStep() public view returns (uint256) {
        return maxDiscountStep;
    }

    function getMaxDiscount() public view returns (uint256) {
        return maxDiscount;
    }
    
    function getUserReferralLink(address _user) public view returns (uint256) {
        return userReferralLink[_user];
    }

    function getCollateralPrice(address _token)
        public
        view
        returns (uint256)
    {
            uint256 assetPrice = IDIADaptor(DIADaptor).getUnderlyingPrice(_token);
            return assetPrice;
    }

    function getUserReferralDiscount(address _user) public view returns (uint256) {
        uint256 discount;
        if(isWhitelistedAddress(_user)) {
            discount = whitelistedDiscount[_user];
        } else {
            uint256 count = getUserTVL(_user);
            uint256 totalTVL = count;
            uint256 arraylen = discountArray.length;

            for (uint256 i = 0; i < arraylen; i++) {
                if (totalTVL > discountArray[i] && totalTVL <= discountArray[i+1]) {
                    //core logic
                    discount = discountPercentOnReferralCount[discountArray[i]];
                    break;
                } else if (totalTVL >= maxDiscountStep) {
                    //max discount
                    discount = maxDiscount;
                    break;
                } else if (totalTVL == 0 ) {
                    discount = 0;
                    break;
                }
            }
        }
        return discount;
    }

    function getUserReferralFees(address _user) public view returns (uint256) {
        uint256 referralFee;
        if(isWhitelistedAddress(_user)) {
            referralFee = whitelistedReferralFees[_user];
        } else {
            uint256 count = getUserTVL(_user);
            uint256 totalTVL = count;
            uint256 arraylen = referralArray.length;
            for (uint256 i = 0; i < arraylen; i++) {
                if (totalTVL > referralArray[i] && totalTVL <= referralArray[i+1]) {
                    //core logic
                    referralFee = referralPercentOnReferralCount[referralArray[i]];
                    break;
                } else if (totalTVL >= maxDiscountStep) {
                    //max discount
                    referralFee = maxReferral;
                    break;
                } else if (totalTVL == 0 ) {
                    referralFee = 0;
                    break;
                }
            }
        }
        return referralFee;
    }

    /**
     * Core functions.
    */

    function changeReferralLink(uint256 _referralLink) public {
        require(canChangeReferralLink[msg.sender] == true, "You already signed up with a link or changed it once");
        require(referralLinkSecurity[_referralLink] != address(0), "Referral Link does not exist");
        require(userReferralStatus[msg.sender] == true, "You need to be registered");
        userReferredFrom[msg.sender] = _referralLink;
        canChangeReferralLink[msg.sender] = false;
        userReferralList[referralLinkSecurity[_referralLink]].push(block.number);
    }

    //This just signs up the user with admin ref link
    function signUp(address _user) public nonReentrant {
        address user;
        if (msg.sender == Stackit) {
            user = _user;
        } else {
            user = msg.sender;
        }

        require(userReferralStatus[user] == false, "You are already registered");
        //we need the referral link to be free in order to create it for the user
        require(referralLinkSecurity[block.number] == address(0), "Referral Link already taken");

        userReferralLink[user] = block.number;
        referralLinkSecurity[block.number] = user;
        userReferralStatus[user] = true;
        //default link
        userReferredFrom[user] = defaultReferralLink;
        canChangeReferralLink[user] = true;
    }

    //This will create a referral link for the user, and sign him up with a referral link from another user
    function signUpWithReferral(uint256 _referralLink,address _user) public nonReentrant {
        address user;
        if (msg.sender == Stackit) {
            user = _user;
        } else {
            user = msg.sender;
        }
        
        require(userReferralStatus[user] == false, "You are already registered");
        require(userReferredFrom[user] == 0, "You are already have a referral");
        //we need the referal link to exist already so that its being used to refer the user
        require(referralLinkSecurity[_referralLink] != address(0), "Referral Link does not exist");

        userReferralLink[user] = block.number;
        referralLinkSecurity[block.number] = msg.sender;
        userReferralStatus[user] = true;
        userReferredFrom[user] = _referralLink;

        //we add the new user to the _referralLink owner list
        userReferralList[referralLinkSecurity[_referralLink]].push(block.number);
    }


}