// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationOracle {
    struct Reputation {
        uint32 completedTasks;
        uint32 disputedTasks;
        uint16 averageRatingBps;
        uint256 totalEarningsUsdc;
        uint64 lastUpdated;
    }

    function recordCompletion(uint256 agentId, uint256 earningsUsdc, uint16 ratingBps) external;
    function recordDispute(uint256 agentId) external;
    function getReputation(uint256 agentId) external view returns (Reputation memory);
    function weightedScore(uint256 agentId) external view returns (uint256);
}
