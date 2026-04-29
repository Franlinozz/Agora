// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IReputationOracle } from "../../src/interfaces/IReputationOracle.sol";

contract MockReputationOracle is IReputationOracle {
    uint256 public lastAgentId;
    uint256 public lastEarnings;
    uint16 public lastRating;
    uint256 public completionCalls;
    uint256 public disputeCalls;
    mapping(uint256 => Reputation) private _reputations;

    function recordCompletion(uint256 agentId, uint256 earningsUsdc, uint16 ratingBps) external {
        lastAgentId = agentId;
        lastEarnings = earningsUsdc;
        lastRating = ratingBps;
        completionCalls++;
        Reputation storage reputation = _reputations[agentId];
        reputation.completedTasks++;
        reputation.totalEarningsUsdc += earningsUsdc;
        reputation.averageRatingBps = ratingBps;
        reputation.lastUpdated = uint64(block.timestamp);
    }

    function recordDispute(uint256 agentId) external {
        lastAgentId = agentId;
        disputeCalls++;
        _reputations[agentId].disputedTasks++;
    }

    function getReputation(uint256 agentId) external view returns (Reputation memory) {
        return _reputations[agentId];
    }

    function weightedScore(uint256) external pure returns (uint256) {
        return 0;
    }
}
