// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloWorld {
    string public greeting;
    address public owner;

    event GreetingChanged(address indexed sender, string message);

    constructor() {
        greeting = "Hello, World!";
        owner = msg.sender;
    }

    function greet() external view returns (string memory) {
        return greeting;
    }

    function setGreeting(string calldata _greeting) external {
        greeting = _greeting;
        emit GreetingChanged(msg.sender, _greeting);
    }

    function donate(uint256 amount) external payable {
        require(msg.value >= amount, "Insufficient ETH sent");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
