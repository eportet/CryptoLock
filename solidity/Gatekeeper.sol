pragma solidity ^0.4.0;

contract Gatekeeper {

    struct Account {
        bool isValid;
        string fName;
        string lName;
    }

    mapping (address => Account) accounts;
    address[] private authorizedAccts;

    function Gatekeeper() public{
	    setAccount(0xa1b29Ae29C6A877383Ad50F5a66EE2Ef0a75e84E, "Eduardo", "Portet");
	}

    function setAccount(address _address, string _fName, string _lName) private {
        Account storage account = accounts[_address];

        account.isValid = true;
        account.fName = _fName;
        account.lName = _lName;

        authorizedAccts.push(_address) -1;
    }

	function authorizeAddress(address _address) public constant returns (bool){
        Account storage account = accounts[_address];
        return account.isValid;

	}
}
