// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";

import { AgentRegistry } from "../src/core/AgentRegistry.sol";
import { EscrowManager } from "../src/core/EscrowManager.sol";
import { ReputationOracle } from "../src/core/ReputationOracle.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address erc6551Registry = vm.envAddress("ERC6551_REGISTRY");
        address erc6551Impl = vm.envAddress("ERC6551_ACCOUNT_IMPL");
        address mediator = vm.envAddress("MEDIATOR_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");

        vm.startBroadcast(pk);

        AgentRegistry registry = new AgentRegistry(erc6551Registry, erc6551Impl);
        console2.log("AgentRegistry:", address(registry));

        ReputationOracle reputation = new ReputationOracle();
        console2.log("ReputationOracle:", address(reputation));

        EscrowManager escrow = new EscrowManager(usdc, address(registry), mediator, feeRecipient);
        console2.log("EscrowManager:", address(escrow));

        escrow.setReputationOracle(address(reputation));
        reputation.setEscrowManager(address(escrow));

        vm.stopBroadcast();

        console2.log("=== Deployment complete ===");
        console2.log("Add to .env:");
        console2.log(" AGENT_REGISTRY=", address(registry));
        console2.log(" ESCROW_MANAGER=", address(escrow));
        console2.log(" REPUTATION_ORACLE=", address(reputation));
    }
}
