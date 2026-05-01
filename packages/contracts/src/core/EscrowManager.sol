// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { IAgentRegistry } from "../interfaces/IAgentRegistry.sol";
import { IEscrowManager } from "../interfaces/IEscrowManager.sol";
import { IReputationOracle } from "../interfaces/IReputationOracle.sol";
import { Errors } from "../libraries/Errors.sol";
import { Events } from "../libraries/Events.sol";

contract EscrowManager is IEscrowManager, Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IAgentRegistry public immutable agentRegistry;
    IReputationOracle public reputationOracle;
    address public mediator;
    uint256 private _nextEscrowId = 1;
    mapping(uint256 => Escrow) private _escrows;

    uint256 public constant MIN_ESCROW = 1_000;
    uint256 public constant MAX_ESCROW = 10_000_000_000;
    uint256 public constant PROTOCOL_FEE_BPS = 500;
    uint16 public constant DEFAULT_RATING_BPS = 7500;
    address public protocolFeeRecipient;

    constructor(address usdc_, address agentRegistry_, address mediator_, address feeRecipient_)
        Ownable(msg.sender)
    {
        if (
            usdc_ == address(0) || agentRegistry_ == address(0) || mediator_ == address(0)
                || feeRecipient_ == address(0)
        ) revert Errors.ZeroAddress();
        usdc = IERC20(usdc_);
        agentRegistry = IAgentRegistry(agentRegistry_);
        mediator = mediator_;
        protocolFeeRecipient = feeRecipient_;
    }

    modifier onlyMediator() {
        if (msg.sender != mediator) revert Errors.UnauthorizedMediator(msg.sender);
        _;
    }

    function createEscrow(
        uint256 agentId,
        bytes32 taskHash,
        uint256 amountUsdc,
        uint64 deadline,
        bool confidential,
        bytes calldata encryptedTaskBlob
    ) external nonReentrant whenNotPaused returns (uint256 escrowId) {
        if (amountUsdc < MIN_ESCROW) revert Errors.AmountTooSmall(amountUsdc, MIN_ESCROW);
        if (amountUsdc > MAX_ESCROW) revert Errors.AmountTooLarge(amountUsdc, MAX_ESCROW);
        // Deadline validation intentionally relies on chain time for escrow expiry.
        // forge-lint: disable-next-line(block-timestamp)
        if (deadline <= block.timestamp) revert Errors.DeadlinePassed(deadline, block.timestamp);
        if (confidential && encryptedTaskBlob.length == 0) revert Errors.InsufficientFunding(1, 0);

        agentRegistry.ownerOf(agentId);
        usdc.safeTransferFrom(msg.sender, address(this), amountUsdc);

        escrowId = _nextEscrowId++;
        _escrows[escrowId] = Escrow({
            agentId: agentId,
            buyer: msg.sender,
            amountUsdc: amountUsdc,
            taskHash: taskHash,
            deliveryHash: bytes32(0),
            deadline: deadline,
            state: uint8(EscrowState.Funded),
            confidential: confidential,
            encryptedTaskBlob: encryptedTaskBlob,
            encryptedDeliveryBlob: ""
        });

        emit Events.EscrowCreated(escrowId, agentId, msg.sender, amountUsdc, confidential);
        emit Events.EscrowFunded(escrowId, amountUsdc);
    }

    function submitDelivery(
        uint256 escrowId,
        bytes32 deliveryHash,
        bytes calldata encryptedDeliveryBlob
    ) external nonReentrant whenNotPaused {
        Escrow storage escrow = _escrowOrRevert(escrowId);
        if (escrow.state != uint8(EscrowState.Funded)) {
            revert Errors.InvalidEscrowState(escrowId, escrow.state, uint8(EscrowState.Funded));
        }
        if (agentRegistry.tbaOf(escrow.agentId) != msg.sender) {
            revert Errors.NotAgentOwner(msg.sender, escrow.agentId);
        }
        if (deliveryHash == bytes32(0)) revert Errors.InvalidAgentId(escrow.agentId);
        if (escrow.confidential && encryptedDeliveryBlob.length == 0) {
            revert Errors.InsufficientFunding(1, 0);
        }

        escrow.deliveryHash = deliveryHash;
        escrow.encryptedDeliveryBlob = encryptedDeliveryBlob;
        escrow.state = uint8(EscrowState.Delivered);
        emit Events.DeliverySubmitted(escrowId, deliveryHash);
    }

    function verifyAndRelease(uint256 escrowId) external nonReentrant whenNotPaused onlyMediator {
        Escrow storage escrow = _escrowOrRevert(escrowId);
        if (
            escrow.state != uint8(EscrowState.Delivered)
                && escrow.state != uint8(EscrowState.Disputed)
        ) {
            revert Errors.InvalidEscrowState(escrowId, escrow.state, uint8(EscrowState.Delivered));
        }

        uint256 fee = (escrow.amountUsdc * PROTOCOL_FEE_BPS) / 10_000;
        uint256 payout = escrow.amountUsdc - fee;
        escrow.state = uint8(EscrowState.Released);

        usdc.safeTransfer(agentRegistry.tbaOf(escrow.agentId), payout);
        usdc.safeTransfer(protocolFeeRecipient, fee);
        if (address(reputationOracle) != address(0)) {
            reputationOracle.recordCompletion(escrow.agentId, payout, DEFAULT_RATING_BPS);
        }

        emit Events.EscrowVerified(escrowId, msg.sender);
        emit Events.EscrowReleased(escrowId, payout, fee);
    }

    function dispute(uint256 escrowId, string calldata reason) external whenNotPaused {
        Escrow storage escrow = _escrowOrRevert(escrowId);
        if (
            escrow.state != uint8(EscrowState.Funded)
                && escrow.state != uint8(EscrowState.Delivered)
        ) {
            revert Errors.InvalidEscrowState(escrowId, escrow.state, uint8(EscrowState.Funded));
        }
        address owner = agentRegistry.ownerOf(escrow.agentId);
        if (msg.sender != escrow.buyer && msg.sender != owner) {
            revert Errors.NotAgentOwner(msg.sender, escrow.agentId);
        }
        escrow.state = uint8(EscrowState.Disputed);
        if (address(reputationOracle) != address(0)) {
            reputationOracle.recordDispute(escrow.agentId);
        }
        emit Events.EscrowDisputed(escrowId, msg.sender, reason);
    }

    function refundExpired(uint256 escrowId) external nonReentrant whenNotPaused {
        Escrow storage escrow = _escrowOrRevert(escrowId);
        if (escrow.state != uint8(EscrowState.Funded)) {
            revert Errors.InvalidEscrowState(escrowId, escrow.state, uint8(EscrowState.Funded));
        }
        // Expiry refunds intentionally rely on chain time.
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp <= escrow.deadline) {
            revert Errors.DeadlinePassed(escrow.deadline, block.timestamp);
        }

        uint256 amount = escrow.amountUsdc;
        escrow.state = uint8(EscrowState.Refunded);
        usdc.safeTransfer(escrow.buyer, amount);
        emit Events.EscrowRefunded(escrowId, amount);
    }

    function setMediator(address newMediator) external onlyOwner {
        if (newMediator == address(0)) revert Errors.ZeroAddress();
        mediator = newMediator;
    }

    function setReputationOracle(address newReputationOracle) external onlyOwner {
        if (newReputationOracle == address(0)) revert Errors.ZeroAddress();
        reputationOracle = IReputationOracle(newReputationOracle);
    }

    function setProtocolFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert Errors.ZeroAddress();
        protocolFeeRecipient = newRecipient;
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return _escrowOrRevert(escrowId);
    }

    function totalEscrows() external view returns (uint256) {
        return _nextEscrowId - 1;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _escrowOrRevert(uint256 escrowId) internal view returns (Escrow storage escrow) {
        if (escrowId == 0 || escrowId >= _nextEscrowId) revert Errors.EscrowNotFound(escrowId);
        escrow = _escrows[escrowId];
    }
}
