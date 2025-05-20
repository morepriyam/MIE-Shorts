import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";

export function useFirstTimeOpen() {
  const [isFirstTime, setIsFirstTime] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkFirstTimeOpen() {
      try {
        const hasOpened = await AsyncStorage.getItem("hasOpened");

        if (hasOpened == null) {
          setIsFirstTime(true);
        } else {
          setIsFirstTime(false);
        }
      } catch (e) {
        console.error("e:firsttime", e);
      } finally {
        setIsLoading(false);
      }
    }
    checkFirstTimeOpen();
  }, []);

  return { isFirstTime, isLoading };
}
