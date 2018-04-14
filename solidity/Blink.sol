pragma solidity ^0.4.0;

contract Blink {
    uint storedData;

	event ItBlinks(uint data);

	function set(uint x) public{
        storedData = x;
    	emit ItBlinks(storedData);
	}

	function get() public constant returns (uint retVal) {
        return storedData;
	}
}
