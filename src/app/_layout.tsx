import * as Notifications from "expo-notifications";
import { BibliotecaProvider } from "../context/BibliotecaContext";
import { NavegacionPrincipal } from "../components/NavegacionPrincipal";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <BibliotecaProvider>
      <NavegacionPrincipal />
    </BibliotecaProvider>
  );
}
