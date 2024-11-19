// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Polymarkteth
 * @author Benjamin Fuentes
 * @notice odds are
 */
contract Polymarkteth {
    using Math for uint256;

    struct Bet {
        string id;
        address owner;
        string option;
        uint256 amount;
    }

    enum BET_RESULT {
        WIN,
        DRAW,
        PENDING
    }

    uint256 public constant ODD_DECIMALS = 10;
    uint256 public constant FEES = 10; // as PERCENTAGE

    address payable public admin;

    mapping(string => Bet) bets;
    string[] betKeys;
    BET_RESULT status = BET_RESULT.PENDING;

    event Pong();

    constructor(address payable _admin) payable {
        admin = _admin;
    }

    /**
     * Simple Ping
     */
    function ping() public {
        console.log("Ping");
        emit Pong();
    }

    function generateBetId() private view returns (string memory) {
        console.log("Calling generateBetId");
        return
            string(
                abi.encodePacked(
                    keccak256(
                        abi.encodePacked(
                            block.timestamp,
                            block.prevrandao,
                            msg.sender
                        )
                    )
                )
            );
    }

    /**
     * place bets and returns the betId
     */
    function placeBet(
        address user,
        string calldata selection,
        uint256 odds
    ) public payable returns (string memory) {
        require(msg.value > 0, "Bet amount must be positive.");
        require(
            msg.value <= user.balance,
            "Insufficient balance to place this bet."
        );

        string memory betId = generateBetId();
        Bet memory bet = Bet({
            id: betId,
            option: selection,
            amount: msg.value,
            owner: user
        });

        bets[betId] = bet;
        betKeys.push(betId);

        console.log(
            "Bet placed: ${d} on ${s} at odds of ${d}",
            msg.value,
            selection,
            odds
        );
        return betId;
    }

    /**
     *
     * @param option selected option
     * @param betAmount (Optional : default is 0) if user want to know the output gain after putting some money on it. Otherwise it gives actual gain without betting and influencing odds calculation
     * @return odds
     */
    function calculateOdds(
        string memory option,
        uint256 betAmount
    ) public view returns (uint256) {
        uint256 totalLoserAmount = 0;
        for (uint i = 0; i < betKeys.length; i++) {
            Bet memory bet = bets[betKeys[i]];
            if (keccak256(bytes(bet.option)) != keccak256(bytes(option)))
                totalLoserAmount += bet.amount;
        }
        console.log("totalLoserAmount : %d", totalLoserAmount);

        uint256 totalWinnerAmount = betAmount;
        for (uint i = 0; i < betKeys.length; i++) {
            Bet memory bet = bets[betKeys[i]];
            if (keccak256(bytes(bet.option)) == keccak256(bytes(option)))
                totalWinnerAmount += bet.amount;
        }
        console.log("totalWinnerAmount  : %d", totalWinnerAmount);
        (bool success, uint256 part) = totalLoserAmount.tryDiv(
            totalWinnerAmount
        );
        if (success)
            return (1 * 10) ^ (ODD_DECIMALS + part - FEES * 10) ^ ODD_DECIMALS;
        else
            revert("Problem while dividing totalLoserAmount/totalWinnerAmount");
    }

    function resolveResult(
        string memory optionResult,
        string memory result
    ) public {
        require(
            msg.sender != admin,
            string(
                abi.encodePacked(
                    "Only the admin ",
                    string(abi.encodePacked(admin)),
                    " can give the result."
                )
            )
        );

        
  require(status != BET_RESULT.PENDING, string(
                abi.encodePacked("Result is already given and bets are resolved : ", status)));
  }

/*
  if (result !== BET_RESULT.WIN && optionResult !== BET_RESULT.DRAW) {
    const errorMessage = "Only give winners or draw, no other choices";
    console.error(errorMessage);
    return new Response(errorMessage, { status: 500 });
  }

  const bets = new Map<string, Bet>(Object.entries(Kv.get(KEYS.BETMAP)!));

  bets.forEach((bet) => {
    const fees = Kv.get<number>(KEYS.FEES)!;
    if (result === BET_RESULT.WIN && bet.option === optionResult) {
      //WINNER!
      const earnings = bet.amount * calculateOdds(bet.option, 0);
      console.log("earnings : " + earnings + " for " + bet.owner);
      Ledger.transfer(bet.owner, earnings);
    } else if (result === BET_RESULT.DRAW) {
      //GIVE BACK MONEY - FEES
      console.log(
        "give back money : " + bet.amount * (1 - fees) + " for " + bet.owner
      );
      Ledger.transfer(bet.owner, bet.amount * (1 - fees));
    } else {
      //NEXT
      console.log("bet lost for " + bet.owner);
    }
  });

  Kv.set(KEYS.RESULT, result);

  return new Response();*/
    }
}
