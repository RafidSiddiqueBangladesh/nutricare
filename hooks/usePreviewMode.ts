export const usePreviewMode = () => {
  const isPreviewMode = false;
  const handleSaveAttempt = () => true; // allow saves by default
  return { isPreviewMode, handleSaveAttempt };
};

export default usePreviewMode;
