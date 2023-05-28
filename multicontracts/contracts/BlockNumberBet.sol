// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BlockNumberBet {
	uint256 public constant MIN_BLOCKS_AHEAD = 10;
	uint256 public constant MAX_BLOCKS_AHEAD = 100;

	mapping(address => uint256) public degenToBlockNumberBet;

	function gambleOnTenthBlockNumber() external payable {
		// ONE ETHER : fixed val
		require(msg.value == 1 ether, 'Not Degen Enough');
		// If the bet is already placed then one cannot bet (REDUNDANT TEST : can be checked by performming unit testing)
		require(address(this).balance >= 1 ether, "Can't gamble with you");
		// If the user has betted once and a specific number of the blocks have not been passed then one has to wait for the bet.
		require(
			block.number > degenToBlockNumberBet[msg.sender] + MAX_BLOCKS_AHEAD,
			'Wait for cooldown time'
		);

		degenToBlockNumberBet[msg.sender] = block.number + MIN_BLOCKS_AHEAD;
	}

	function claimWinnings() external {
		// One should let the MIN_BLOCKS_AHEAD time to be passed
		require(
			block.number > MIN_BLOCKS_AHEAD + degenToBlockNumberBet[msg.sender],
			'Too early !!'
		);
		// If the time is passed beyond the limit then we can't claim
		// Reason : the blockhash feature is only available for the 250ish blocks at a time otherwise it will return zero then 0%2 = 0 and the user will always win
		require(
			block.number <= MAX_BLOCKS_AHEAD + degenToBlockNumberBet[msg.sender],
			'Too Late !!'
		);

		if (uint256(blockhash(degenToBlockNumberBet[msg.sender])) % 2 == 0) {
			payable(msg.sender).transfer(1 ether);
		}
	}
}
