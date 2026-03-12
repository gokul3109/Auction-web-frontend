"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Using a ref ensures a single store instance across re-renders in Next.js
  const storeRef = useRef(store);
  return <Provider store={storeRef.current}>{children}</Provider>;
}
