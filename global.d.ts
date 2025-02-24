interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  on: (eventName: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (
    eventName: string,
    handler: (...args: unknown[]) => void
  ) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
