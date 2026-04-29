// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Errors {
    error InvalidAgentId(uint256 agentId);
    error AgentNotFound(uint256 agentId);
    error NotAgentOwner(address caller, uint256 agentId);
    error InvalidEscrowState(uint256 escrowId, uint8 currentState, uint8 requiredState);
    error EscrowNotFound(uint256 escrowId);
    error InsufficientFunding(uint256 required, uint256 provided);
    error DeadlinePassed(uint256 deadline, uint256 now_);
    error UnauthorizedMediator(address caller);
    error InvalidPrice(uint256 price);
    error AmountTooSmall(uint256 amount, uint256 min);
    error AmountTooLarge(uint256 amount, uint256 max);
    error ZeroAddress();
    error AlreadyDelivered(uint256 escrowId);
    error TransferFailed();
    error ReentrancyDetected();
}
