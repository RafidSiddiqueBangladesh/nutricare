export type ToastOptions = { title?: string; description?: string };

export const useToast = () => {
  const toast = (opts: ToastOptions) => {
    // Minimal toast shim: log to console. UIs can be added later.
    console.info("toast:", opts.title, opts.description);
  };
  return { toast };
};

export default useToast;
