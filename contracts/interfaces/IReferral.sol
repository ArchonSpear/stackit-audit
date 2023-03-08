pragma solidity 0.8.7;

interface IReferral {
    function getUserReferralDiscount(address _user) external view returns (uint256);
    function getUserReferralFees(address _user) external view returns (uint256);
    function getWasReferredFrom(address _user) external view returns (address);
    function isUserSignedUp(address _user) external view returns (bool);
    function signUp(address _user) external;
    function signUpWithReferral(uint256 _referralLink,address _user) external;
    function setUserSharedStreamStatus(address _user, bool _status) external;
    function setUserSingleStreamStatus(address _user, bool _status) external;
}