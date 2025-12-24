// Import and re-export ABI from generated file
import { custodyAbi } from './generated'

// Type-safe ABI export
export const CustodyABI = custodyAbi

// Re-export event names from custody
export { 
  ChannelOpenedEvent,
  ChannelClosedEvent,
  ChannelChallengedEvent,
  ChannelCheckpointedEvent,
  ChannelCreatedEvent,
  ChannelJoinedEvent
} from './custody'