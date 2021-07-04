import { useEffect } from "react";

const useFluxStore = (Store, handleNewResources, onMount) => {
  const handleChange = () => {
    handleNewResources(Store.getResources());
  };

  /**
   * Listens to the store for changes, and
   * removes the listener when it unmounts
   */
  useEffect(() => {
    Store.on("change", handleChange);
    if (onMount) {
      onMount()
    }
    return () => Store.removeListener("change", handleChange);
  }, []);
};

export default useFluxStore;