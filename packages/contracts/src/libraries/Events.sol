// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Events {
    event AgentDeployed(
        uint256 indexed agentId, address indexed deployer, address tba, string metadataURI
    );
    event AgentPriceUpdated(uint256 indexed agentId, uint256 oldPrice, uint256 newPrice);
    event AgentDeactivated(uint256 indexed agentId);
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed agentId,
        address indexed buyer,
        uint256 amount,
        bool confidential
    );
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event DeliverySubmitted(uint256 indexed escrowId, bytes32 deliveryHash);
    event EscrowVerified(uint256 indexed escrowId, address indexed mediator);
    event EscrowReleased(uint256 indexed escrowId, uint256 toAgent, uint256 protocolFee);
    event EscrowDisputed(uint256 indexed escrowId, address indexed disputer, string reason);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    event ReputationUpdated(
        uint256 indexed agentId,
        uint32 completed,
        uint32 disputed,
        uint16 averageRating,
        uint256 totalEarnings
    );
}
