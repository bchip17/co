// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "./libraries/SafeERC20.sol";

import "./interfaces/IRouter.sol";
import "./interfaces/IRewards.sol";

contract PoolBCP {

	using SafeERC20 for IERC20; 

	address public owner;
	address public router;

	address public bcp; // BCP address

	mapping(address => uint256) private balances; // account => amount staked
	uint256 public totalSupply;

	// Events
    event DepositBCP(
    	address indexed user, 
    	uint256 amount
    );
    event WithdrawBCP(
    	address indexed user,
    	uint256 amount
    );

	constructor(address _bcp) {
		owner = msg.sender;
		bcp = _bcp;
	}

	// Governance methods

	function setOwner(address newOwner) external onlyOwner {
		owner = newOwner;
	}

	function setRouter(address _router) external onlyOwner {
		router = _router;
	}

	function deposit(uint256 amount) external {

		require(amount > 0, "!amount");

		_updateRewards();

		totalSupply += amount;
		balances[msg.sender] += amount;

		IERC20(bcp).safeTransferFrom(msg.sender, address(this), amount);

		emit DepositBCP(
			msg.sender,
			amount
		);

	}

	function withdraw(uint256 amount) external {
		
		require(amount > 0, "!amount");

		if (amount >= balances[msg.sender]) {
			amount = balances[msg.sender];
		}

		_updateRewards();

		totalSupply -= amount;
		balances[msg.sender] -= amount;

		IERC20(bcp).safeTransfer(msg.sender, amount);

		emit WithdrawBCP(
			msg.sender,
			amount
		);

	}

	function getBalance(address account) external view returns(uint256) {
		return balances[account];
	}

	function _updateRewards() internal {
		uint256 length = IRouter(router).currenciesLength();
		for (uint256 i = 0; i < length; i++) {
			address currency = IRouter(router).currencies(i);
			address rewardsContract = IRouter(router).getBcpRewards(currency);
			IRewards(rewardsContract).updateRewards(msg.sender);
		}
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "!owner");
		_;
	}

}