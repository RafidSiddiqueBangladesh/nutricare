export type ToastOptions = { title?: string; description?: string };

export const useToast = () => {
  const toast = (opts: ToastOptions) => {
    console.info("toast:", opts.title, opts.description);
  };
  return { toast };
};

export default useToast;
