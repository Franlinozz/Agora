// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentRegistry {
    struct AgentMetadata {
        address deployer;
        address tba;
        uint256 pricePerCallUsdc;
        bytes32 capabilityHash;
        string metadataURI;
        uint64 createdAt;
        bool active;
    }

    function deployAgent(
        string calldata metadataURI,
        bytes32 capabilityHash,
        uint256 pricePerCallUsdc
    ) external returns (uint256 agentId);

    function updatePrice(uint256 agentId, uint256 newPrice) external;
    function deactivateAgent(uint256 agentId) external;
    function getAgent(uint256 agentId) external view returns (AgentMetadata memory);
    function totalAgents() external view returns (uint256);
    function ownerOf(uint256 agentId) external view returns (address);
    function tbaOf(uint256 agentId) external view returns (address);
}
