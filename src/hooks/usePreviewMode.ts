export const usePreviewMode = () => {
  const isPreviewMode = false;
  const handleSaveAttempt = () => true;
  return { isPreviewMode, handleSaveAttempt };
};

export default usePreviewMode;
