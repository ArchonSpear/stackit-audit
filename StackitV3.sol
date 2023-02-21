pragma solidity 0.8.7;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import './interfaces/IUniswapV2Router02.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IReferral.sol';
import "hardhat/console.sol";

interface IReferralAggregator{
    function addAmountToUser(uint256 _amount, address _asset, address _user) external;
}

interface IStargate{
    function addLiquidity(
        uint256 _poolId,
        uint256 _amountLD,
        address _to
    ) external;

    function instantRedeemLocal(
        uint16 _srcPoolId,
        uint256 _amountLP,
        address _to
    ) external returns (uint256 amountSD);
}

interface IStargatePool{
    function amountLPtoLD(uint256 _amountLP) external view returns (uint256);
}

interface IVault {
    function depositAll() external;
    function withdrawAll() external;
    function deposit(uint256 _amounts) external;
    function withdraw(uint256 _amounts) external;
    function getPricePerFullShare() external view returns (uint256);
    function balanceOf(address _address) external returns (uint256);
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}

interface IDIADaptor {
    function getUnderlyingPrice(address cToken) external view returns (uint256);
}

contract StackitV3 is ReentrancyGuardUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public treasury;
    address public Referrals;
    address public DIADaptor;
    address public ReferralFeesAggregator;
    address public stargateRouter;
    address public Keeper;
    uint256 public treasuryInboundFees;
    uint256 public treasuryOutboundFees;
    uint256 public buybackFees;
    uint256[] public allStreams;
    uint256[] public activeStreams;
    uint256[] private _amountsOut;

    struct Stream {
        uint256 amount;
        uint256 totalAmount;
        uint256 interval;  
        uint256 startTime;
        uint256 lastSwap;
        uint256 isactive;
        uint256 buyWithSwapped;
        uint256 toBuyReceived;
        address buyWith;
        address toBuy;
        address owner;
        uint256 iteration;
        uint256 shares;
    }

    struct StreamAmounts {
        //has no yield
        uint256 assetAmount;
    }

    struct RecordCounter {
        uint256 counter;
    }

    struct Vaults {
        address asset;
        address vault;
    }

   struct SwapDescriptionV2 {
    IERC20 srcToken;
    IERC20 dstToken;
    address[] srcReceivers; // transfer src token to these addresses, default
    uint256[] srcAmounts;
    address[] feeReceivers;
    uint256[] feeAmounts;
    address dstReceiver;
    uint256 amount;
    uint256 minReturnAmount;
    uint256 flags;
    bytes permit;
   }

   struct SwapExecutionParams {
    address callTarget; // call this address
    address approveTarget; // approve this address if _APPROVE_FUND set
    bytes targetData;
    SwapDescriptionV2 generic;
    bytes clientData;
   }

    mapping(address => uint[]) public list;
    mapping(uint256 => Stream) public streams;
    mapping(uint256 => StreamAmounts) public streamAmounts;
    mapping(address => Vaults) public vaults;
    mapping(uint256 => uint256) public amountLeftInStream;
    mapping(uint256 => uint256) public userAggregatedDiscount;
    mapping(address => uint256) public assetDecimals;


    //one asset basket ID for an array of assets
    mapping(uint256 => address[]) public streamBasketOfAsset;
    //stream ID, asset address, percent
    mapping(uint256 => mapping(address => uint256)) private aggregateRepartitionForStream;

    mapping(uint256 => bool) public streamNature;
    mapping(uint256 => bool) public streamYield;
    mapping(address => bool) public assetHasYield;

    mapping(address => uint16) public stargatePoolID;
    mapping(address => address) public stargateAsset;

    mapping(uint256 => bool) public streamReady;
    mapping(uint256 => uint256) public streamReadyMultiple;
    mapping(uint256 => uint256) public streamReadyBuyAmount;
    mapping(uint256 => mapping(uint256 => uint256)) private streamReadyBuyAmountMultiple;

    mapping(address => uint256) public minimumAmountPerBuy;
    mapping(uint256 => mapping(address => uint256)) private multipleAmountsForStream;

    RecordCounter[] public recordcounter;
    uint256[] public allStreamsReady;
    uint256 public MAX_INT;
    address public AGGREGATION_ROUTER_V5;

    modifier onlyKeeper() {
        require(msg.sender == Keeper, "Stackit : caller is not the keeper");
        _;
    }

    function initialize(
        address _DIADaptor,
        address _AGGREGATION_ROUTER_V5) public initializer {
        treasury = msg.sender;
        treasuryInboundFees = 10; //1%
        treasuryOutboundFees = 10; //1%
        MAX_INT = 2**256 - 1;
        DIADaptor = _DIADaptor;
        AGGREGATION_ROUTER_V5 = _AGGREGATION_ROUTER_V5;
        __Ownable_init();
        __Pausable_init();
    }

    function getUserShares(uint256 count) public view returns (uint256) {
        Stream storage s = streams[count];
        return(s.shares);
    }

    function getMultipleAmountForStream(uint256 count, address _asset) public view returns (uint256) {
        if (isMultipleStream(count)) {
            return multipleAmountsForStream[count][_asset];
        } else {
            return 0;
        }
    }

    function getStreamAggregatedDiscount(uint256 _count) public view returns (uint256) {
        return userAggregatedDiscount[_count];
    }

    function getAmountLeftInVault(uint256 _count) public view returns (uint256) {
        return amountLeftInStream[_count];
    }

    function getAllStreams() public view returns (uint256[] memory) {
        return allStreams;
    }

    function getStreamBasket(uint256 _count) public view returns (address[] memory) {
        return streamBasketOfAsset[_count];
    }

    function getMinimumAmount(address _asset) public view returns (uint256) {
        return minimumAmountPerBuy[_asset];
    }

    // for front end peeps
    function getListOfStreams(address _user) public view returns (uint[] memory) {
        return (list[_user]);
    }

    function getListOfStreamsReady() public view returns (uint256[] memory) {
        return (allStreamsReady);
    }

    function getStreamBasketOfAssets(uint256 _count) public view returns (address[] memory) {
        return streamBasketOfAsset[_count];
    }

    // UI team needs to return it for every assets of the user array
    function getStreamRepartition(uint256 _count, uint256 _assetId) public view returns (uint256) {
        uint256 percent = aggregateRepartitionForStream[_count][streamBasketOfAsset[_count][_assetId]];
        return percent;
    }

    // for front end peeps
    function getStreamStats(uint256 _index) public view returns(
        uint256 amount,
        uint256 totalAmount,
        uint256 buyWithSwapped,
        uint256 toBuyReceived,
        uint256 shares) {
    return (
        streams[_index].amount,
        streams[_index].totalAmount,
        streams[_index].buyWithSwapped,
        streams[_index].toBuyReceived,
        streams[_index].shares);
    }

        // for front end peeps
    function getStreamDetails(uint256 _index) public view returns(
        uint256 interval,
        uint256 startTime,
        uint256 lastSwap,
        uint256 isactive,
        address buyWith,
        address toBuy,
        uint256 iteration) {
    return (
        streams[_index].interval,
        streams[_index].startTime,
        streams[_index].lastSwap,
        streams[_index].isactive,
        streams[_index].buyWith,
        streams[_index].toBuy,
        streams[_index].iteration);
    }

    function isYieldActive(uint256 _streamId) public view returns (bool) {
        return streamYield[_streamId];
    }

    function isMultipleStream(uint256 _count) public view returns (bool) {
        return streamNature[_count];
    }

    function isStreamReady(uint256 count) public view returns (bool) {
        return streamReady[count];
    }

    function getStreamReadyMultipleBuyAmount(uint256 count) public view returns (uint256) {
        return (streamReadyBuyAmountMultiple[count][streamReadyMultiple[count]]);
    }

    function getStreamReadyBuyAmount(uint256 count) public view returns (uint256) {
        return (streamReadyBuyAmount[count]);
    }

    function getNextAssetToSwap(uint256 _count) public view returns (address) {
        address[] memory addresses = streamBasketOfAsset[_count];
        address bought = streamBasketOfAsset[_count][streamReadyMultiple[_count]];
        return bought;
    }

    // check that is the right time to trigger a swap for a certain user
    // NOTE: this function needs to return 0 for the transaction to be possible
    function check_time(uint256 count) public view returns(uint){
        Stream storage s = streams[count];
        if (s.isactive == 0) { 
            // if the user was never created
            return MAX_INT;
            
        } else if (block.timestamp < s.lastSwap + s.interval){
            // if the user was created, but it's not yet time to make a swap, return the remaining time in seconds
            return s.lastSwap + s.interval - block.timestamp; 
            
        } else {
            // if the timing is good to make the swap, return 0
            return 0;  
        }
    }

    function setKeeper(address _keeper) public onlyOwner {
        require(_keeper != address(0), "No ded address ser");
        Keeper = _keeper;
    }

    function setAggregator(address _AGGREGATION_ROUTER_V5) public onlyOwner {
        AGGREGATION_ROUTER_V5 = _AGGREGATION_ROUTER_V5;
    }

    function setAssetDecimals(address _asset, uint256 _decimals) public onlyOwner {
        assetDecimals[_asset] = _decimals;
    }

    function setAssetYield(address _asset, bool _yield) public onlyOwner {
        assetHasYield[_asset] = _yield;
    }

    function setReferralFeesAggregator(address _ReferralFeesAggregator) public onlyOwner {
        ReferralFeesAggregator = _ReferralFeesAggregator;
    }

    function setOracle(address _DIADaptor) public onlyOwner {
        DIADaptor = _DIADaptor;
    }

    function setStargateParams(address _asset, uint16 _poolId, address _stargateAsset) public onlyOwner {
        stargatePoolID[_asset] = _poolId;
        stargateAsset[_asset] = _stargateAsset;
    }

    function setStargateRouter(address _router) public onlyOwner {
        stargateRouter = _router;
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function setReferrals(address _Referrals) public onlyOwner {
        Referrals = _Referrals;
    }

    function setFees(
        uint256 _treasuryInboundFees,
        uint256 _treasuryOutboundFees
        ) public onlyOwner {
        require(_treasuryInboundFees <= 50 && _treasuryOutboundFees <= 50,"Incorrect Fees");
        treasuryInboundFees = _treasuryInboundFees;
        treasuryOutboundFees = _treasuryOutboundFees;
    }

    function addAssetVault(
        address _asset,
        address _vault) public onlyOwner {
        Vaults storage v = vaults[_asset];
        v.asset = _asset;
        v.vault = _vault;
    } 

    function setMinimumAmount(uint256 _buyAmount, address _asset) public onlyOwner {
        require(_buyAmount > 0, "No Zeroguerino");
        minimumAmountPerBuy[_asset] = _buyAmount;
    }
    
    //allow the user to activate the dca stream
    //by default, a stream is set to active (isactive =1) when it is originally created
    //amount to spend PER buy
    //interval to buy
    //buyWIth xx token
    //what token to buy'
    //route from buy with to to buy
    // how many times to buy
    function activate(
        uint256 _amount,
        uint256 _intervalInSec,
        address _buyWith,
        uint256 _refLink,
        address _toBuy,
        uint256 _iteration,
        uint256 _startTime,
        bool _yieldActive) 
        external whenNotPaused nonReentrant {
        address buyWith = _buyWith;
        require(_amount >= minimumAmountPerBuy[buyWith] ,"Please add more than the minimum amount per buy");
        if (msg.sender != owner()) {
            require(_startTime > block.timestamp,"Stream start date should be in the future");
        }
        require(_iteration > 1,"Minimum two iterations required");

        if (assetHasYield[buyWith] == false && _yieldActive) {
            revert("Asset does not have yield, please change selection");
        }

        if (!IReferral(Referrals).isUserSignedUp(msg.sender)) {
            if (_refLink != 0) {
                IReferral(Referrals).signUpWithReferral(_refLink,msg.sender);
            } else {
                IReferral(Referrals).signUp(msg.sender);
            }
        }

        // in any case, push new struct to records
        uint256 count = recordcounter.length;
        streamYield[count] = _yieldActive;

        Stream storage s = streams[count];
        StreamAmounts storage sa = streamAmounts[count];

        //we compute the total amount that will be spent
        uint256 totalAmount = _iteration.mul(_amount);
        uint256 totalAmountAdjusted = totalAmount;

        recordcounter.push(RecordCounter(count));
        //create the stream
        s.amount = _amount;
        s.totalAmount = totalAmount;
        s.interval = _intervalInSec;
        s.startTime = _startTime;
        s.lastSwap = 0;
        s.isactive = 1;
        s.buyWithSwapped = 0;
        s.toBuyReceived = 0;
        s.buyWith = buyWith;
        s.toBuy = _toBuy;
        s.owner = msg.sender;
        s.iteration = _iteration;
        s.shares = 0;

        amountLeftInStream[count] = totalAmountAdjusted;
        
        list[msg.sender].push(count);
        //deposit to our contracts
        IERC20(buyWith).safeTransferFrom(msg.sender, address(this), totalAmountAdjusted);

        if (streamYield[count]) {
            _depositToVault(count, totalAmountAdjusted, false);
        } else {
            sa.assetAmount = sa.assetAmount.add(totalAmountAdjusted);
        }
        allStreams.push(count);
        streamNature[count] = false;
    }

    function activateMultiple(
        uint256 _amount,
        uint256 _intervalInSec,
        address _buyWith,
        uint256 _refLink,
        uint256 _iteration,
        address[] memory _streamBasketOfAsset,
        uint256[] memory _streamAggregateRepartition,
        uint256 _startTime,
        bool _yieldActive
        ) 
        external whenNotPaused nonReentrant {
        address buyWith = _buyWith;
        require(_amount >= minimumAmountPerBuy[buyWith] ,"Please add more than the minimum amount per buy");
        if (msg.sender != owner()) {
            require(_startTime > block.timestamp,"Stream start date should be in the future");
        }
        require(_iteration > 1,"Minimum two iterations required");
        require(_streamBasketOfAsset.length != 0, "Must be a multiple stream");

        if (assetHasYield[buyWith] == false && _yieldActive) {
            revert("Asset does not have yield, please change selection");
        }

        if (!IReferral(Referrals).isUserSignedUp(msg.sender)) {
            if (_refLink != 0) {
                IReferral(Referrals).signUpWithReferral(_refLink,msg.sender);
            } else {
                IReferral(Referrals).signUp(msg.sender);
            }
        }

        // in any case, push new struct to records
        uint256 count = recordcounter.length;
        streamYield[count] = _yieldActive;

        Stream storage s = streams[count];
        StreamAmounts storage sa = streamAmounts[count];

        //we compute the total amount that will be spent
        uint256 totalAmount = _iteration.mul(_amount);
        uint256 totalAmountAdjusted = totalAmount;

        recordcounter.push(RecordCounter(count));

        s.amount = _amount;
        s.totalAmount = totalAmount;
        s.interval = _intervalInSec;
        s.startTime = _startTime;
        s.lastSwap = 0;
        s.isactive = 1;
        s.buyWithSwapped = 0;
        s.toBuyReceived = 0;
        s.buyWith = buyWith;
        s.owner = msg.sender;
        s.iteration = _iteration;
        s.shares = 0;

        amountLeftInStream[count] = totalAmountAdjusted;
        _createStreamMultiple(count,_streamBasketOfAsset,_streamAggregateRepartition);

        list[msg.sender].push(count);
        //deposit to our contracts
        IERC20(buyWith).safeTransferFrom(msg.sender, address(this), totalAmountAdjusted);
        if (streamYield[count]) {
            _depositToVault(count, totalAmountAdjusted, false);
        } else {
            sa.assetAmount = sa.assetAmount.add(totalAmountAdjusted);
        }
        allStreams.push(count);
        streamNature[count] = true;
    }
    

    function _createStreamMultiple(uint256 count, address[] memory _streamBasketOfAsset, uint256[] memory _streamAggregateRepartition) internal {
            streamNature[count] = true;
            streamBasketOfAsset[count] = _streamBasketOfAsset;
            uint256 assetLen = _streamBasketOfAsset.length;
            uint256 reapLen = _streamAggregateRepartition.length;
            require(assetLen == reapLen, "Invalid repatition among assets");
                
            uint256 mathCheck;
            for (uint256 i = 0; i < assetLen; i++) {
                uint256 percent = _streamAggregateRepartition[i];
                require(percent >= 10, "Allocation cannot be less than 10%");
                aggregateRepartitionForStream[count][_streamBasketOfAsset[i]] = percent;
                mathCheck = mathCheck.add(_streamAggregateRepartition[i]);
            }
        require(mathCheck == 100, "Uneven percentage repartition among assets");
    }

    function _depositToVault(uint256 count, uint256 amount, bool topup) internal {
        Stream storage s = streams[count];
        Vaults storage v = vaults[s.buyWith];
        StreamAmounts storage sa = streamAmounts[count];

        address assetUsed = s.buyWith;

        uint256 balStargateBefore = IERC20(stargateAsset[assetUsed]).balanceOf(address(this));
        IERC20(assetUsed).safeApprove(stargateRouter, amount);
        IStargate(stargateRouter).addLiquidity(stargatePoolID[assetUsed],amount,address(this));
        uint256 balStargateAfter = IERC20(stargateAsset[assetUsed]).balanceOf(address(this));

        uint256 stargateReceived = balStargateAfter.sub(balStargateBefore);

        //give proper allowance to vault
        IERC20(stargateAsset[assetUsed]).safeApprove(v.vault, stargateReceived);
        //update shares and deposit to the vault
        uint256 balBefore = IERC20(v.vault).balanceOf(address(this));

        IVault(v.vault).deposit(stargateReceived);
        uint256 balAfter = IERC20(v.vault).balanceOf(address(this));
        uint256 usersShares = balAfter.sub(balBefore);

        if (topup == true) {
            s.shares = s.shares.add(usersShares);
        } else {
            s.shares = usersShares;
        }
    }

    // allow the user to stop the dca stream
    function stop(uint256 count) external {
        Stream storage s = streams[count];
        require(msg.sender == s.owner, "Not the cremlord");
        require(s.isactive == 1, "Stream innactive");
        require(streamReady[count] == false,"Stream is pending activation");
        s.isactive = 0;
    } 

    // allow the user to re-start the dca stream
    function start(uint256 count) external {
        Stream storage s = streams[count];
        require(msg.sender == s.owner, "Not the cremlord");
        require(s.isactive == 0, "Already active");
        require(streamReady[count] == false,"Stream is pending activation");
        s.isactive = 1;
    } 
    
    // just edit the interval
    function editIntervals(uint256 count, uint256 _interval) external {
        Stream storage s = streams[count];
        require(msg.sender == s.owner, "Not the cremlord");
        require(s.isactive == 0, "Already active");
        require(streamReady[count] == false,"Stream is pending activation");
        s.interval = _interval;
    }

    // allow the user to edit the individual amount that is regularly purchased
    function topUp(uint256 count, uint256 _amount) external nonReentrant {
        Stream storage s = streams[count];
        StreamAmounts storage sa = streamAmounts[count];

        require(msg.sender == s.owner, "Not the cremlord");
        require(s.isactive == 1,'Stream innactive');
        require(streamReady[count] == false,"Stream is pending activation");

        uint256 totalAmount = s.iteration.mul(_amount);
        uint256 totalAmountAdjusted = totalAmount;
        s.amount = s.amount.add(_amount);
        s.totalAmount = s.totalAmount.add(totalAmountAdjusted);
        amountLeftInStream[count] = amountLeftInStream[count].add(totalAmount);

        IERC20(s.buyWith).safeTransferFrom(msg.sender, address(this), totalAmountAdjusted);
        if (isYieldActive(count)) {
            _depositToVault(count, totalAmountAdjusted, true);
        } else {
            sa.assetAmount = sa.assetAmount.add(totalAmountAdjusted);
        }
    }

    function withdrawAsset(uint256 count) public nonReentrant {
        Stream storage s = streams[count];
        Vaults storage v = vaults[s.buyWith];
        StreamAmounts storage sa = streamAmounts[count];
        
        require(msg.sender == s.owner, "Not the cremlord");
        require(s.isactive == 1,'Stream is not active');
        require(s.lastSwap != 0, "You must execute one iteration before withdrawing");
        require(streamReady[count] == false,"Stream is pending activation");

        uint256 userShares;
        address assetUsed = s.buyWith;
        address stargateAsset = stargateAsset[assetUsed];
        uint256 receivedAssets;

        if (isYieldActive(count)) {
            require(s.shares > 0, "Stream already finished");
            userShares = s.shares;
            s.shares = 0;
            s.isactive = 0;
            amountLeftInStream[count] = 0;

            uint256 assetBalAS = IERC20(stargateAsset).balanceOf(address(this));
            IVault(v.vault).withdraw(userShares);
            uint256 assetBalBS = IERC20(stargateAsset).balanceOf(address(this));
            
            uint256 receivedStargateAssets = assetBalBS.sub(assetBalAS);

            uint256 assetBalA = IERC20(assetUsed).balanceOf(address(this));
            IStargate(stargateRouter).instantRedeemLocal(stargatePoolID[assetUsed], receivedStargateAssets,address(this));
            uint256 assetBalB = IERC20(assetUsed).balanceOf(address(this));

            receivedAssets = assetBalB.sub(assetBalA);
        } else {
            receivedAssets = sa.assetAmount;
            sa.assetAmount = 0;
            s.isactive = 0;
            amountLeftInStream[count] = 0;
        }

        IERC20(s.buyWith).safeTransfer(s.owner,receivedAssets);
    }

    function convertCompoundedAmount(uint256 count) external nonReentrant onlyKeeper {
        Stream storage s = streams[count];
        Vaults storage v = vaults[s.buyWith];
        StreamAmounts storage sa = streamAmounts[count];
        require(s.isactive == 1,'Stream is not active');
        require(block.timestamp > s.lastSwap + s.interval,'!time, Back to sleep bruvv');
        require(streamReady[count] == false,"Stream is pending activation");
        require(block.timestamp > s.startTime,'Not time to start yet');
        address assetUsed = s.buyWith;
        uint256 amountUsed;
        bool lastExec;
        uint256 tempShares;

        if (s.iteration.sub(1) == 0){
            s.iteration = s.iteration.sub(1);
            amountUsed = amountLeftInStream[count];
            amountLeftInStream[count] = 0;
            lastExec = true;
            s.isactive = 0;
        } else {
            s.iteration = s.iteration.sub(1);
            amountUsed = s.amount;
        }

        uint256 buyAmount;
        uint256 am;

        if (streamYield[count]) {

            uint256 stargateShares = amountUsed.mul(1e6).div(IStargatePool(stargateAsset[assetUsed]).amountLPtoLD(1e6));
            uint256 assetBalBefore = IERC20(stargateAsset[assetUsed]).balanceOf(address(this));

            if (lastExec == false) {
                tempShares = stargateShares.mul(1e18).div(IVault(v.vault).getPricePerFullShare());
                s.shares = s.shares.sub(tempShares);
            } else {
                tempShares = s.shares;
                s.shares = 0;
            }

            IVault(v.vault).withdraw(tempShares);
            uint256 balStargateAfter = IERC20(stargateAsset[assetUsed]).balanceOf(address(this));
            uint256 assetBalA = IERC20(assetUsed).balanceOf(address(this));

            IStargate(stargateRouter).instantRedeemLocal(stargatePoolID[assetUsed], balStargateAfter.sub(assetBalBefore),address(this));
            uint256 assetBalB = IERC20(assetUsed).balanceOf(address(this));
            am = assetBalB.sub(assetBalA);

        } else {
            am = s.amount;
            if (lastExec == false) {
                sa.assetAmount = sa.assetAmount.sub(am);
            } else {
                 sa.assetAmount = 0;
            }
        }

        (buyAmount) = _computeFees(s.owner, am, count, assetUsed);

        if (isMultipleStream(count)) {
            address[] memory addresses = streamBasketOfAsset[count];
            for (uint256 i = 0; i < addresses.length; i++) {
                streamReadyBuyAmountMultiple[count][i] = buyAmount.mul(getStreamRepartition(count,i)).div(100);
            }
            
        } else {
            streamReadyBuyAmount[count] = buyAmount;
        }

        streamReady[count] = true;
        allStreamsReady.push(count);
        s.lastSwap = block.timestamp;
    }

    function executeBuy(uint256 count,bytes calldata _data, bool _swapSimple) public onlyKeeper nonReentrant {
        Stream storage s = streams[count];
        require(streamReady[count],"Stream isnt ready yet");

        SwapDescriptionV2 memory desc;

        if (_swapSimple) {
            // 0x8af033fb -> swapSimpleMode
            (, SwapDescriptionV2 memory des,,) = abi.decode(_data[4:], (address, SwapDescriptionV2, bytes, bytes));
            desc = des;
        } else {
            // 0x59e50fed -> swapGeneric
            // 0xe21fd0e9 -> swap
            (SwapExecutionParams memory des) = abi.decode(_data[4:], (SwapExecutionParams));
            desc = des.generic;
        }

            require(desc.dstReceiver == address(this),"Receiver must be this contract");
            
            address bought;
            address[] memory addresses = streamBasketOfAsset[count];
            if (isMultipleStream(count)) {
                bought = streamBasketOfAsset[count][streamReadyMultiple[count]];
            } else {
                bought = s.toBuy;
            }
            uint256 assetBalBefore = IERC20(bought).balanceOf(address(this));
            IERC20(s.buyWith).safeApprove(AGGREGATION_ROUTER_V5,desc.amount);

            (bool succ,) = address(AGGREGATION_ROUTER_V5).call(_data);
            require(succ == true, "Swap failed");
            uint256 assetBalAfter = IERC20(bought).balanceOf(address(this));

            uint256 _outboundFees = (assetBalAfter.sub(assetBalBefore)).mul(treasuryOutboundFees).div(1000);
            IERC20(bought).safeTransfer(s.owner, (assetBalAfter.sub(assetBalBefore)).sub(_outboundFees)); // to the user
            IERC20(bought).safeTransfer(treasury, _outboundFees); // to the treasury

            //If multiple stream, we exec for the lenght of the basket of assets, turning to false when all assets have been bought
            //otherwise we just keep with the normal exec
            if (isMultipleStream(count)) {
                require(desc.amount == getStreamReadyMultipleBuyAmount(count),"Invalid amount for multiple stream");
                require(bought == address(desc.dstToken), "Wrong destination token");
                multipleAmountsForStream[count][address(desc.dstToken)] = multipleAmountsForStream[count][address(desc.dstToken)] + (assetBalAfter.sub(assetBalBefore)).sub(_outboundFees);

                if (streamReady[count]) {
                    streamReadyMultiple[count] = streamReadyMultiple[count].add(1);
                    if (streamReadyMultiple[count] == addresses.length) {
                        streamReady[count] = false;
                        streamReadyMultiple[count] = 0;
                    }
                }
                
                //stream end or not
                if (s.iteration > 0 && streamReady[count]) {
                    amountLeftInStream[count] = amountLeftInStream[count].sub(desc.amount);
                } 
            } else {
                require(desc.amount == getStreamReadyBuyAmount(count),"Invalid amount for stream");
                s.toBuyReceived = s.toBuyReceived + (assetBalAfter.sub(assetBalBefore)).sub(_outboundFees);
                streamReady[count] = false;

                //stream end or not
                if (s.iteration > 0) {
                amountLeftInStream[count] = amountLeftInStream[count].sub(desc.amount);
                }
            }
            
            s.buyWithSwapped = s.buyWithSwapped + desc.amount;
            
            //If buying exec is done, we delete it from the ready array
            if (streamReady[count] == false) {
                for (uint256 i = 0; i < allStreamsReady.length; i++) {
                    if (allStreamsReady[i] == count) {
                        delete allStreamsReady[i];
                        break;
                    }
                }
                streamReadyBuyAmount[count] = 0;
            }
    }

    function _computeFees(address _user, uint256 _amount, uint256 _count, address _buyWith) internal returns(uint256) {
        Stream storage s = streams[_count];
        address wasReferredFrom = IReferral(Referrals).getWasReferredFrom(_user);
        uint256 totalFee = _amount.mul(treasuryInboundFees).div(1000);

        uint256 discount = totalFee.mul(IReferral(Referrals).getUserReferralDiscount(_user)).div(100);
        userAggregatedDiscount[_count] = userAggregatedDiscount[_count].add(discount);

        uint256 toRef = totalFee.mul(IReferral(Referrals).getUserReferralFees(wasReferredFrom)).div(100);

        IERC20(_buyWith).safeTransfer(treasury, (totalFee.sub(toRef).sub(discount)));  // to the Treasury
        IERC20(_buyWith).safeTransfer(wasReferredFrom, toRef);  // to ref
        IReferralAggregator(ReferralFeesAggregator).addAmountToUser(toRef,s.toBuy,wasReferredFrom);
        IERC20(_buyWith).safeTransfer(_user, discount); // to user as discount

        uint256 buyAmount = _amount.sub(totalFee);
        return buyAmount;
    }

}