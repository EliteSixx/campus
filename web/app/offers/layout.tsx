import type { ReactNode } from "react";
import { OffersStoreProvider } from "./_state/offers-store";

export default function OffersLayout({ children }: { children: ReactNode }) {
  return <OffersStoreProvider>{children}</OffersStoreProvider>;
}
