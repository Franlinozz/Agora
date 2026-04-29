// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IEscrowManager {
    enum EscrowState {
        Created,
        Funded,
        Delivered,
        Verified,
        Released,
        Disputed,
        Refunded
    }

    struct Escrow {
        uint256 agentId;
        address buyer;
        uint256 amountUsdc;
        bytes32 taskHash;
        bytes32 deliveryHash;
        uint64 deadline;
        uint8 state;
        bool confidential;
        bytes encryptedTaskBlob;
        bytes encryptedDeliveryBlob;
    }

    function createEscrow(
        uint256 agentId,
        bytes32 taskHash,
        uint256 amountUsdc,
        uint64 deadline,
        bool confidential,
        bytes calldata encryptedTaskBlob
    ) external returns (uint256 escrowId);

    function submitDelivery(
        uint256 escrowId,
        bytes32 deliveryHash,
        bytes calldata encryptedDeliveryBlob
    ) external;

    function verifyAndRelease(uint256 escrowId) external;
    function dispute(uint256 escrowId, string calldata reason) external;
    function refundExpired(uint256 escrowId) external;
    function getEscrow(uint256 escrowId) external view returns (Escrow memory);
    function totalEscrows() external view returns (uint256);
}
