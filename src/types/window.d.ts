// Extend the global Window interface
export {};

declare global {
  interface Window {
    scrollTimeout?: ReturnType<typeof setTimeout>;
  }
}

