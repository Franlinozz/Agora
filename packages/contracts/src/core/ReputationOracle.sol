// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";

import { IReputationOracle } from "../interfaces/IReputationOracle.sol";
import { Errors } from "../libraries/Errors.sol";
import { Events } from "../libraries/Events.sol";

contract ReputationOracle is IReputationOracle, Ownable2Step {
    mapping(uint256 => Reputation) private _reputations;
    address public escrowManager;

    constructor() Ownable(msg.sender) { }

    modifier onlyEscrowManager() {
        if (msg.sender != escrowManager) revert Errors.UnauthorizedMediator(msg.sender);
        _;
    }

    function setEscrowManager(address newEscrowManager) external onlyOwner {
        if (newEscrowManager == address(0)) revert Errors.ZeroAddress();
        if (escrowManager != address(0)) revert Errors.UnauthorizedMediator(msg.sender);
        escrowManager = newEscrowManager;
    }

    function recordCompletion(uint256 agentId, uint256 earningsUsdc, uint16 ratingBps)
        external
        onlyEscrowManager
    {
        Reputation storage reputation = _reputations[agentId];
        uint32 completed = reputation.completedTasks + 1;
        uint256 averageRating =
            ((uint256(reputation.averageRatingBps) * (completed - 1)) + ratingBps) / completed;
        // Average stays within uint16 because every rating input is uint16.
        // forge-lint: disable-next-line(unsafe-typecast)
        reputation.averageRatingBps = uint16(averageRating);
        reputation.completedTasks = completed;
        reputation.totalEarningsUsdc += earningsUsdc;
        reputation.lastUpdated = uint64(block.timestamp);

        emit Events.ReputationUpdated(
            agentId,
            reputation.completedTasks,
            reputation.disputedTasks,
            reputation.averageRatingBps,
            reputation.totalEarningsUsdc
        );
    }

    function recordDispute(uint256 agentId) external onlyEscrowManager {
        Reputation storage reputation = _reputations[agentId];
        reputation.disputedTasks += 1;
        reputation.lastUpdated = uint64(block.timestamp);

        emit Events.ReputationUpdated(
            agentId,
            reputation.completedTasks,
            reputation.disputedTasks,
            reputation.averageRatingBps,
            reputation.totalEarningsUsdc
        );
    }

    function getReputation(uint256 agentId) external view returns (Reputation memory) {
        return _reputations[agentId];
    }

    function weightedScore(uint256 agentId) external view returns (uint256) {
        Reputation memory reputation = _reputations[agentId];
        int256 score = int256(uint256(reputation.completedTasks) * 100)
            - int256(uint256(reputation.disputedTasks) * 250)
            + int256(uint256(reputation.averageRatingBps) / 100);
        // Cast is safe after clamping negative values to zero.
        // forge-lint: disable-next-line(unsafe-typecast)
        return score < 0 ? 0 : uint256(score);
    }
}
