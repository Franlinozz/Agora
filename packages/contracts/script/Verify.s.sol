// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";

import { EscrowManager } from "../src/core/EscrowManager.sol";
import { ReputationOracle } from "../src/core/ReputationOracle.sol";

contract Verify is Script {
    function run() external view {
        address escrowAddress = vm.envAddress("ESCROW_MANAGER");
        address reputationAddress = vm.envAddress("REPUTATION_ORACLE");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address mediator = vm.envAddress("MEDIATOR_ADDRESS");

        EscrowManager escrow = EscrowManager(escrowAddress);
        ReputationOracle reputation = ReputationOracle(reputationAddress);

        require(address(escrow.usdc()) == usdc, "wrong USDC");
        require(escrow.mediator() == mediator, "wrong mediator");
        require(address(escrow.reputationOracle()) == reputationAddress, "wrong reputation oracle");
        require(reputation.escrowManager() == escrowAddress, "wrong escrow manager");

        console2.log("Deployment wiring verified");
    }
}
