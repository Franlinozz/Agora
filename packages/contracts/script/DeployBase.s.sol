// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ERC6551Account } from "erc6551/examples/simple/ERC6551Account.sol";

import { AgentRegistry } from "../src/core/AgentRegistry.sol";
import { EscrowManager } from "../src/core/EscrowManager.sol";
import { ReputationOracle } from "../src/core/ReputationOracle.sol";

contract DeployBase is Script {
    address internal constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant CANONICAL_ERC6551_REGISTRY =
        0x000000006551c19487814612e58FE06813775758;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address mediator = vm.envAddress("MEDIATOR_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");

        vm.startBroadcast(pk);

        ERC6551Account accountImplementation = new ERC6551Account();
        console2.log("ERC6551AccountImpl:", address(accountImplementation));

        AgentRegistry registry =
            new AgentRegistry(CANONICAL_ERC6551_REGISTRY, address(accountImplementation));
        console2.log("AgentRegistry:", address(registry));

        ReputationOracle reputation = new ReputationOracle();
        console2.log("ReputationOracle:", address(reputation));

        EscrowManager escrow =
            new EscrowManager(BASE_USDC, address(registry), mediator, feeRecipient);
        console2.log("EscrowManager:", address(escrow));

        escrow.setReputationOracle(address(reputation));
        reputation.setEscrowManager(address(escrow));

        vm.stopBroadcast();

        console2.log("=== Base mainnet deployment complete ===");
        console2.log("Add to Vercel / app env:");
        console2.log(" NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org");
        console2.log(" NEXT_PUBLIC_BASE_USDC_ADDRESS=", BASE_USDC);
        console2.log(" NEXT_PUBLIC_BASE_AGENT_REGISTRY=", address(registry));
        console2.log(" NEXT_PUBLIC_BASE_ESCROW_MANAGER=", address(escrow));
        console2.log(" NEXT_PUBLIC_BASE_REPUTATION_ORACLE=", address(reputation));
        console2.log("Add to packages/contracts/.env for sanity checks:");
        console2.log(" AGENT_REGISTRY=", address(registry));
        console2.log(" ESCROW_MANAGER=", address(escrow));
        console2.log(" REPUTATION_ORACLE=", address(reputation));
        console2.log(" ERC6551_ACCOUNT_IMPL=", address(accountImplementation));
    }
}
