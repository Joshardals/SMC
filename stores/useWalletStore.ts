import { create } from "zustand";

interface WalletState {
  address: string;
  isConnected: boolean;
  setAddress: (address: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: "",
  isConnected: false,
  setAddress: (address) => set({ address, isConnected: true }),
  disconnect: () => set({ address: "", isConnected: false }),
}));
