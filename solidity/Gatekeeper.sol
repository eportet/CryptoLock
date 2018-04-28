pragma solidity ^0.4.0;

contract Gatekeeper {

  struct Account {
    bool isValid;
    string cardData;
    string fName;
    string lName;
  }

  mapping (string => Account) accounts;
  string data;

  constructor() public{
    setAccount("helo", "Eduardo", "Portet");
  }

  function setAccount(string _cardData, string _fName, string _lName) private {
    data = _cardData;

    Account storage account = accounts[_cardData];

    account.isValid = true;
    account.fName = _fName;
    account.lName = _lName;

  }

  function getValidData() public view returns (string) {
    return data;
  }

  function moveData(string _cardData, string _newData) private returns (bool){
    accounts[_newData].isValid = true;
    accounts[_newData].fName = accounts[_cardData].fName;
    accounts[_newData].lName = accounts[_cardData].lName;

    accounts[_cardData].isValid = false;
    accounts[_cardData].fName = "";
    accounts[_cardData].lName = "";

    data = _newData;
    return true;
  }

  function check(string _cardData, string _newData) public returns (bool) {
    if (accounts[_cardData].isValid) {
        return moveData(_cardData, _newData);
    } else {
     return false;
    }
  }

}
