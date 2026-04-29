// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";

import { ReputationOracle } from "../src/core/ReputationOracle.sol";
import { Errors } from "../src/libraries/Errors.sol";

contract ReputationOracleTest is Test {
    ReputationOracle oracle;
    address escrowManager = address(0xE5C);

    function setUp() public {
        oracle = new ReputationOracle();
        oracle.setEscrowManager(escrowManager);
    }

    function test_RecordCompletion_OnlyEscrowManager() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedMediator.selector, address(this)));
        oracle.recordCompletion(1, 100, 7500);
    }

    function test_RecordCompletion_IncrementsCompleted() public {
        vm.prank(escrowManager);
        oracle.recordCompletion(1, 100, 7500);
        assertEq(oracle.getReputation(1).completedTasks, 1);
    }

    function test_RecordCompletion_AccumulatesEarnings() public {
        vm.startPrank(escrowManager);
        oracle.recordCompletion(1, 100, 7500);
        oracle.recordCompletion(1, 200, 7500);
        vm.stopPrank();
        assertEq(oracle.getReputation(1).totalEarningsUsdc, 300);
    }

    function test_RecordCompletion_AveragesRating() public {
        vm.startPrank(escrowManager);
        oracle.recordCompletion(1, 100, 5000);
        oracle.recordCompletion(1, 100, 7500);
        oracle.recordCompletion(1, 100, 10000);
        vm.stopPrank();
        assertEq(oracle.getReputation(1).averageRatingBps, 7500);
    }

    function test_RecordDispute_IncrementsDispute() public {
        vm.prank(escrowManager);
        oracle.recordDispute(1);
        assertEq(oracle.getReputation(1).disputedTasks, 1);
    }

    function test_WeightedScore_FormulaCorrect() public {
        vm.startPrank(escrowManager);
        oracle.recordCompletion(1, 100, 7500);
        oracle.recordCompletion(1, 100, 7500);
        oracle.recordDispute(1);
        vm.stopPrank();
        assertEq(oracle.weightedScore(1), 25);
    }

    function test_WeightedScore_NeverNegative() public {
        vm.startPrank(escrowManager);
        oracle.recordDispute(1);
        oracle.recordDispute(1);
        vm.stopPrank();
        assertEq(oracle.weightedScore(1), 0);
    }
}
