// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { ERC6551Account } from "erc6551/examples/simple/ERC6551Account.sol";
import { ERC6551Registry } from "erc6551/ERC6551Registry.sol";

import { AgentRegistry } from "../src/core/AgentRegistry.sol";
import { EscrowManager } from "../src/core/EscrowManager.sol";
import { IEscrowManager } from "../src/interfaces/IEscrowManager.sol";
import { Errors } from "../src/libraries/Errors.sol";
import { MockReputationOracle } from "./mocks/MockReputationOracle.sol";
import { MockUSDC } from "./mocks/MockUSDC.sol";

contract EscrowManagerTest is Test {
    MockUSDC usdc;
    AgentRegistry registry;
    EscrowManager escrow;
    MockReputationOracle reputation;
    address agentOwner = address(0xA11CE);
    address buyer = address(0xB0B);
    address mediator = address(0xDAD);
    address feeRecipient = address(0xFEE);
    uint256 agentId;
    uint256 amount = 1_000_000;

    function setUp() public {
        usdc = new MockUSDC();
        ERC6551Registry erc6551Registry = new ERC6551Registry();
        ERC6551Account accountImpl = new ERC6551Account();
        registry = new AgentRegistry(address(erc6551Registry), address(accountImpl));
        vm.prank(agentOwner);
        agentId = registry.deployAgent("ipfs://agent", keccak256("capabilities"), amount);
        escrow = new EscrowManager(address(usdc), address(registry), mediator, feeRecipient);
        reputation = new MockReputationOracle();
        escrow.setReputationOracle(address(reputation));
        usdc.mint(buyer, 20_000_000_000);
        vm.prank(buyer);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function _create() internal returns (uint256) {
        vm.prank(buyer);
        return escrow.createEscrow(
            agentId, keccak256("task"), amount, uint64(block.timestamp + 7 days), false, ""
        );
    }

    function _deliver(uint256 escrowId) internal {
        vm.prank(registry.tbaOf(agentId));
        escrow.submitDelivery(escrowId, keccak256("delivery"), "");
    }

    function test_CreateEscrow_Success() public {
        uint256 escrowId = _create();
        assertEq(usdc.balanceOf(address(escrow)), amount);
        assertEq(escrow.getEscrow(escrowId).state, uint8(IEscrowManager.EscrowState.Funded));
    }

    function test_CreateEscrow_RevertOnAmountTooSmall() public {
        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(Errors.AmountTooSmall.selector, 99_999, 100_000));
        escrow.createEscrow(agentId, bytes32(0), 99_999, uint64(block.timestamp + 1), false, "");
    }

    function test_CreateEscrow_RevertOnAmountTooLarge() public {
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.AmountTooLarge.selector, 10_000_000_001, 10_000_000_000)
        );
        escrow.createEscrow(
            agentId, bytes32(0), 10_000_000_001, uint64(block.timestamp + 1), false, ""
        );
    }

    function test_CreateEscrow_RevertOnPastDeadline() public {
        vm.prank(buyer);
        vm.expectRevert();
        escrow.createEscrow(agentId, bytes32(0), amount, uint64(block.timestamp), false, "");
    }

    function test_CreateEscrow_RevertOnInvalidAgent() public {
        vm.prank(buyer);
        vm.expectRevert();
        escrow.createEscrow(99, bytes32(0), amount, uint64(block.timestamp + 1), false, "");
    }

    function test_CreateEscrow_ConfidentialRequiresBlob() public {
        vm.prank(buyer);
        vm.expectRevert();
        escrow.createEscrow(agentId, bytes32(0), amount, uint64(block.timestamp + 1), true, "");
    }

    function test_SubmitDelivery_OnlyAgentTBA() public {
        uint256 escrowId = _create();
        vm.prank(agentOwner);
        vm.expectRevert();
        escrow.submitDelivery(escrowId, keccak256("delivery"), "");
    }

    function test_SubmitDelivery_StateMustBeFunded() public {
        uint256 escrowId = _create();
        _deliver(escrowId);
        vm.prank(registry.tbaOf(agentId));
        vm.expectRevert();
        escrow.submitDelivery(escrowId, keccak256("delivery2"), "");
    }

    function test_VerifyAndRelease_OnlyMediator() public {
        uint256 escrowId = _create();
        _deliver(escrowId);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedMediator.selector, address(this)));
        escrow.verifyAndRelease(escrowId);
    }

    function test_VerifyAndRelease_PaysAgentMinusFee() public {
        uint256 escrowId = _create();
        _deliver(escrowId);
        address tba = registry.tbaOf(agentId);
        vm.prank(mediator);
        escrow.verifyAndRelease(escrowId);
        assertEq(usdc.balanceOf(tba), 950_000);
        assertEq(usdc.balanceOf(feeRecipient), 50_000);
    }

    function test_VerifyAndRelease_UpdatesReputation() public {
        uint256 escrowId = _create();
        _deliver(escrowId);
        vm.prank(mediator);
        escrow.verifyAndRelease(escrowId);
        assertEq(reputation.completionCalls(), 1);
        assertEq(reputation.lastEarnings(), 950_000);
    }

    function test_RefundExpired_AfterDeadline() public {
        uint256 escrowId = _create();
        vm.warp(block.timestamp + 8 days);
        escrow.refundExpired(escrowId);
        assertEq(usdc.balanceOf(buyer), 20_000_000_000);
    }

    function test_RefundExpired_BeforeDeadline_Reverts() public {
        uint256 escrowId = _create();
        vm.expectRevert();
        escrow.refundExpired(escrowId);
    }

    function test_Dispute_FromBuyer_Works() public {
        uint256 escrowId = _create();
        vm.prank(buyer);
        escrow.dispute(escrowId, "bad");
        assertEq(escrow.getEscrow(escrowId).state, uint8(IEscrowManager.EscrowState.Disputed));
    }

    function test_Dispute_FromAgent_Works() public {
        uint256 escrowId = _create();
        vm.prank(agentOwner);
        escrow.dispute(escrowId, "bad");
        assertEq(escrow.getEscrow(escrowId).state, uint8(IEscrowManager.EscrowState.Disputed));
    }

    function test_Dispute_FromStranger_Reverts() public {
        uint256 escrowId = _create();
        vm.prank(address(0xBAD));
        vm.expectRevert();
        escrow.dispute(escrowId, "bad");
    }

    function test_FullHappyPath_End2End() public {
        uint256 escrowId = _create();
        _deliver(escrowId);
        vm.prank(mediator);
        escrow.verifyAndRelease(escrowId);
        assertEq(escrow.getEscrow(escrowId).state, uint8(IEscrowManager.EscrowState.Released));
        assertEq(usdc.balanceOf(registry.tbaOf(agentId)), 950_000);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }
}
