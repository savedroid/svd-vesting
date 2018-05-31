pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


/**
 * @title Vesting trustee contract for SvdToken.
 */
contract SvdVesting is Ownable {

    using SafeMath for uint256;

    using SafeERC20 for ERC20;

    // SvdToken contract.
    ERC20 public token;

    // Vesting grant for a specific holder.
    struct Grant {
        uint256 value;
        uint256 start;
        uint256 cliff;
        uint256 end;
        uint256 installmentLength; // In seconds.
        uint256 transferred;
        bool revocable;
    }

    // Holder to grant information mapping.
    mapping (address => Grant) public grants;

    // Total tokens available for vesting.
    uint256 public totalVesting;

    event NewGrant(address indexed _from, address indexed _to, uint256 _value);

    event TokensUnlocked(address indexed _to, uint256 _value);

    event GrantRevoked(address indexed _holder, uint256 _refund);

    /**
     * @dev Constructor that initializes the address of the SvdToken contract.
     * @param _token SvdToken The address of the previously deployed SvdToken contract.
     */
    constructor(ERC20 _token) public {
        require(_token != address(0));
        
        token = _token;
    }
    
    /**
     * @dev Unlock vested tokens and transfer them to their holder.
     */
    function unlockVestedTokens() external {
        Grant storage grant_ = grants[msg.sender];

        // Require that the grant is not empty.
        require(grant_.value != 0);
        
        // Get the total amount of vested tokens, according to grant.
        uint256 vested = calculateVestedTokens(grant_, block.timestamp);
        
        if (vested == 0) {
            return;
        }
        
        // Make sure the holder doesn't transfer more than what he already has.
        
        uint256 transferable = vested.sub(grant_.transferred);
        
        if (transferable == 0) {
            return;
        }
        
        // Update transferred and total vesting amount, then transfer remaining vested funds to holder.
        grant_.transferred = grant_.transferred.add(transferable);
        totalVesting = totalVesting.sub(transferable);
        
        token.safeTransfer(msg.sender, transferable);

        emit TokensUnlocked(msg.sender, transferable);
    }

    /**
     * @dev Grant tokens to a specified address. Please note, that the trustee must have enough ungranted tokens
     * to accomodate the new grant. Otherwise, the call with fail.
     * @param _to address The holder address.
     * @param _value uint256 The amount of tokens to be granted.
     * @param _start uint256 The beginning of the vesting period.
     * @param _cliff uint256 Point in time of the end of the cliff period (when the first installment is made).
     * @param _end uint256 The end of the vesting period.
     * @param _installmentLength uint256 The length of each vesting installment (in seconds).
     * @param _revocable bool Whether the grant is revocable or not.
     */
    function granting(address _to, uint256 _value, uint256 _start, uint256 _cliff, uint256 _end,
    uint256 _installmentLength, bool _revocable)
    external onlyOwner 
    {    
        require(_to != address(0));
        
        // Don't allow holder to be this contract.
        require(_to != address(this));
        
        require(_value > 0);
        
        // Require that every holder can be granted tokens only once.
        require(grants[_to].value == 0);
        
        // Require for time ranges to be consistent and valid.
        require(_start <= _cliff && _cliff <= _end);
        
        // Require installment length to be valid and no longer than (end - start).
        require(_installmentLength > 0 && _installmentLength <= _end.sub(_start));
        
        // Grant must not exceed the total amount of tokens currently available for vesting.
        require(totalVesting.add(_value) <= token.balanceOf(address(this)));
        
        // Assign a new grant.
        grants[_to] = Grant({
            value: _value,
            start: _start,
            cliff: _cliff,
            end: _end,
            installmentLength: _installmentLength,
            transferred: 0,
            revocable: _revocable
        });
        
        // Since tokens have been granted, increase the total amount available for vesting.
        totalVesting = totalVesting.add(_value);
        
        emit NewGrant(msg.sender, _to, _value);
    }
    
    /**
     * @dev Calculate the total amount of vested tokens of a holder at a given time.
     * @param _holder address The address of the holder.
     * @param _time uint256 The specific time to calculate against.
     * @return a uint256 Representing a holder's total amount of vested tokens.
     */
    function vestedTokens(address _holder, uint256 _time) external constant returns (uint256) {
        Grant memory grant_ = grants[_holder];
        if (grant_.value == 0) {
            return 0;
        }
        return calculateVestedTokens(grant_, _time);
    }

    /** 
     * @dev Revoke the grant of tokens of a specifed address.
     * @param _holder The address which will have its tokens revoked.
     */
    function revoke(address _holder) public onlyOwner {
        Grant memory grant_ = grants[_holder];

        // Grant must be revocable.
        require(grant_.revocable);

        // Calculate amount of remaining tokens that are still available (i.e. not yet vested) to be returned to owner.
        uint256 vested = calculateVestedTokens(grant_, block.timestamp);
        
        uint256 notTransferredInstallment = vested.sub(grant_.transferred);
        
        uint256 refund = grant_.value.sub(vested);
        
        //Update of transferred not necessary due to deletion of the grant in the following step.
        
        // Remove grant information.
        delete grants[_holder];
        
        // Update total vesting amount and transfer previously calculated tokens to owner.
        totalVesting = totalVesting.sub(refund).sub(notTransferredInstallment);
        
        // Transfer vested amount that was not yet transferred to _holder.
        token.safeTransfer(_holder, notTransferredInstallment);
        
        emit TokensUnlocked(_holder, notTransferredInstallment);
        
        token.safeTransfer(msg.sender, refund);
        
        emit TokensUnlocked(msg.sender, refund);
        
        emit GrantRevoked(_holder, refund);
    }

    /**
     * @dev Calculate amount of vested tokens at a specifc time.
     * @param _grant Grant The vesting grant.
     * @param _time uint256 The time to be checked
     * @return a uint256 Representing the amount of vested tokens of a specific grant.
     */
    function calculateVestedTokens(Grant _grant, uint256 _time) private pure returns (uint256) {
        // If we're before the cliff, then nothing is vested.
        if (_time < _grant.cliff) {
            return 0;
        }
       
        // If we're after the end of the vesting period - everything is vested;
        if (_time >= _grant.end) {
            return _grant.value;
        }
       
        // Calculate amount of installments past until now.
        // NOTE result gets floored because of integer division.
        uint256 installmentsPast = _time.sub(_grant.start).div(_grant.installmentLength);
       
        // Calculate amount of days in entire vesting period.
        uint256 vestingDays = _grant.end.sub(_grant.start);
       
        // Calculate and return installments that have passed according to vesting days that have passed.
        return _grant.value.mul(installmentsPast.mul(_grant.installmentLength)).div(vestingDays);
    }
}
