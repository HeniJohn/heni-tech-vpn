import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
}

export function ScreenContainer({ children, edges = ["top", "left", "right"], className, safeAreaClassName, style, ...props }: ScreenContainerProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: "#07131F" }, style]} {...props}>
      <SafeAreaView edges={edges} className={safeAreaClassName} style={[{ flex: 1, backgroundColor: "#07131F" }, style]}>
        <View className={className} style={{ flex: 1, backgroundColor: "#07131F" }}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
