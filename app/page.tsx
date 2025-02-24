import { ActionsGrid } from "./_components/ActionsGrid";
import { Balance } from "./_components/Balance";
import { ChartSection } from "./_components/ChartSection";
import { ConnectWallet } from "./_components/ConnectWallet";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="max-w-md mx-auto pb-4">
        <ConnectWallet />
        <Balance amount="468.78" />
        <ChartSection />
        <div className="mt-8">
          <ActionsGrid />
        </div>
      </div>
    </main>
  );
}
