export const setupSignals = (shutdown: () => Promise<void>) => {
  const signals = ["SIGTERM", "SIGINT", "SIGHUP", "SIGBREAK"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await shutdown();
    });
  });
};
