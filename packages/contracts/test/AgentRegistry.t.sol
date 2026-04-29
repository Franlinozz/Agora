// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { ERC6551Account } from "erc6551/examples/simple/ERC6551Account.sol";
import { ERC6551Registry } from "erc6551/ERC6551Registry.sol";

import { AgentRegistry } from "../src/core/AgentRegistry.sol";
import { Errors } from "../src/libraries/Errors.sol";
import { Events } from "../src/libraries/Events.sol";

contract AgentRegistryTest is Test {
    AgentRegistry registry;
    address owner = address(0xA11CE);
    address other = address(0xB0B);

    function setUp() public {
        ERC6551Registry erc6551Registry = new ERC6551Registry();
        ERC6551Account accountImpl = new ERC6551Account();
        registry = new AgentRegistry(address(erc6551Registry), address(accountImpl));
    }

    function _deploy() internal returns (uint256) {
        vm.prank(owner);
        return registry.deployAgent("ipfs://agent", keccak256("capabilities"), 1_000_000);
    }

    function test_DeployAgent_Success() public {
        uint256 agentId = _deploy();
        assertEq(registry.ownerOf(agentId), owner);
        assertTrue(registry.tbaOf(agentId) != address(0));
    }

    function test_DeployAgent_RevertOnZeroPrice() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidPrice.selector, 0));
        registry.deployAgent("ipfs://agent", bytes32(0), 0);
    }

    function test_DeployAgent_RevertOnEmptyURI() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAgentId.selector, 0));
        registry.deployAgent("", bytes32(0), 1);
    }

    function test_TwoAgents_HaveDifferentTBAs() public {
        uint256 first = _deploy();
        uint256 second = _deploy();
        assertTrue(registry.tbaOf(first) != registry.tbaOf(second));
    }

    function test_UpdatePrice_OnlyOwner() public {
        uint256 agentId = _deploy();
        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotAgentOwner.selector, other, agentId));
        registry.updatePrice(agentId, 2_000_000);
    }

    function test_UpdatePrice_Success() public {
        uint256 agentId = _deploy();
        vm.expectEmit(true, false, false, true);
        emit Events.AgentPriceUpdated(agentId, 1_000_000, 2_000_000);
        vm.prank(owner);
        registry.updatePrice(agentId, 2_000_000);
        assertEq(registry.getAgent(agentId).pricePerCallUsdc, 2_000_000);
    }

    function test_DeactivateAgent_OnlyOwner() public {
        uint256 agentId = _deploy();
        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotAgentOwner.selector, other, agentId));
        registry.deactivateAgent(agentId);
    }

    function test_TransferAgent_TBAFollows() public {
        uint256 agentId = _deploy();
        address tba = registry.tbaOf(agentId);
        assertEq(ERC6551Account(payable(tba)).owner(), owner);
        vm.prank(owner);
        registry.transferFrom(owner, other, agentId);
        assertEq(ERC6551Account(payable(tba)).owner(), other);
    }

    function test_TotalAgents_TracksCorrectly() public {
        for (uint256 i = 0; i < 5; i++) {
            _deploy();
        }
        assertEq(registry.totalAgents(), 5);
    }
}
