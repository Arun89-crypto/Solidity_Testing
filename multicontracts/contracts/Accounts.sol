// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Accounts {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin Operation");
        _;
    }

    function changeAdmin(address _admin) external onlyAdmin {
        admin = _admin;
    }
}
