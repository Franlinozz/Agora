// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC6551Registry } from "erc6551/interfaces/IERC6551Registry.sol";

import { IAgentRegistry } from "../interfaces/IAgentRegistry.sol";
import { Errors } from "../libraries/Errors.sol";
import { Events } from "../libraries/Events.sol";

contract AgentRegistry is IAgentRegistry, ERC721, Ownable2Step, Pausable, ReentrancyGuard {
    address public immutable erc6551Registry;
    address public immutable erc6551AccountImpl;

    mapping(uint256 => AgentMetadata) private _agents;
    uint256 private _nextAgentId = 1;
    bytes32 private constant SALT = bytes32(uint256(0xA90A));

    constructor(address registry, address accountImplementation)
        ERC721("Agora Agent", "AGENT")
        Ownable(msg.sender)
    {
        if (registry == address(0) || accountImplementation == address(0)) revert Errors.ZeroAddress();
        erc6551Registry = registry;
        erc6551AccountImpl = accountImplementation;
    }

    function deployAgent(
        string calldata metadataURI,
        bytes32 capabilityHash,
        uint256 pricePerCallUsdc
    ) external nonReentrant whenNotPaused returns (uint256 agentId) {
        if (pricePerCallUsdc == 0) {
            revert Errors.InvalidPrice(pricePerCallUsdc);
        }
        if (bytes(metadataURI).length == 0) revert Errors.InvalidAgentId(0);

        agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);

        address tba = IERC6551Registry(erc6551Registry)
            .createAccount(erc6551AccountImpl, SALT, block.chainid, address(this), agentId);

        _agents[agentId] = AgentMetadata({
            deployer: msg.sender,
            tba: tba,
            pricePerCallUsdc: pricePerCallUsdc,
            capabilityHash: capabilityHash,
            metadataURI: metadataURI,
            createdAt: uint64(block.timestamp),
            active: true
        });

        emit Events.AgentDeployed(agentId, msg.sender, tba, metadataURI);
    }

    function updatePrice(uint256 agentId, uint256 newPrice) external whenNotPaused {
        _requireAgentOwner(agentId);
        if (newPrice == 0) revert Errors.InvalidPrice(newPrice);

        uint256 oldPrice = _agents[agentId].pricePerCallUsdc;
        _agents[agentId].pricePerCallUsdc = newPrice;
        emit Events.AgentPriceUpdated(agentId, oldPrice, newPrice);
    }

    function deactivateAgent(uint256 agentId) external whenNotPaused {
        _requireAgentOwner(agentId);
        _agents[agentId].active = false;
        emit Events.AgentDeactivated(agentId);
    }

    function getAgent(uint256 agentId) external view returns (AgentMetadata memory) {
        _requireAgentExists(agentId);
        return _agents[agentId];
    }

    function totalAgents() external view returns (uint256) {
        return _nextAgentId - 1;
    }

    function ownerOf(uint256 agentId)
        public
        view
        override(ERC721, IAgentRegistry)
        returns (address)
    {
        return super.ownerOf(agentId);
    }

    function tbaOf(uint256 agentId) external view returns (address) {
        _requireAgentExists(agentId);
        return _agents[agentId].tba;
    }

    function tokenURI(uint256 agentId) public view override returns (string memory) {
        _requireAgentExists(agentId);
        return _agents[agentId].metadataURI;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _requireAgentExists(uint256 agentId) internal view {
        if (agentId == 0 || agentId >= _nextAgentId) revert Errors.AgentNotFound(agentId);
    }

    function _requireAgentOwner(uint256 agentId) internal view {
        _requireAgentExists(agentId);
        if (ownerOf(agentId) != msg.sender) revert Errors.NotAgentOwner(msg.sender, agentId);
    }
}
