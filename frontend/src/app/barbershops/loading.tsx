import DelayedLoading from "@/components/DelayedLoading";
import AppLoadingScreen from "@/components/AppLoadingScreen";

export default function Loading() {
  return (
    <DelayedLoading delay={300}>
      <AppLoadingScreen />
    </DelayedLoading>
  );
}
