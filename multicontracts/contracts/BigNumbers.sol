// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BigNumbers {
    uint256 public number;

    function setNumber(uint256 _newNumber) external {
        number = _newNumber;
    }

    function setToMax() external {
        number = type(uint256).max;
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}
