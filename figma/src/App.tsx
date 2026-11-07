import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { Icon } from "./components/Icon";
import { usePersistentState } from "./lib/storage";
import Home from "./screens/Home";
import Admin from "./screens/Admin";
import { Logbook } from "./screens/Logbook";
import Notes from "./screens/Notes";
import Points from "./screens/Points";
import Profile from "./screens/Profile";
import Family from "./screens/Family";
import Emergency from "./screens/Emergency";
import UtilityScreen from "./screens/UtilityScreen";
import Welcome from "./screens/Welcome";
import AccountCreate from "./screens/AccountCreate";
import type { AccountProfile, PatientId, Screen } from "./types";

export default function App() {
  const [account, setAccount] = usePersistentState<AccountProfile | null>("account:profile", null);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedPatient, setSelectedPatient] = usePersistentState<PatientId>(
    "ui:selectedPatient",
    "jose",
  );
  const [history, setHistory] = useState<Screen[]>([]);
  const [toast, setToast] = useState("");
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const navigate = (next: Screen) => {
    if (next === screen) return;
    setHistory((current) => [...current, screen]);
    setScreen(next);
    document.querySelector(".app-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    const previous = history.at(-1) ?? (account ? "home" : "welcome");
    setHistory((current) => current.slice(0, -1));
    setScreen(previous);
    document.querySelector(".app-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const activeScreen: Screen = account
    ? screen
    : screen === "account-create"
      ? "account-create"
      : "welcome";
  const render = () => {
    if (activeScreen === "welcome") return <Welcome navigate={navigate} />;
    if (activeScreen === "account-create")
      return (
        <AccountCreate
          navigate={navigate}
          notify={notify}
          onCreate={(profile) => {
            setAccount(profile);
            setHistory([]);
            setScreen("home");
            notify(`Cuenta creada. Bienvenido, ${profile.name.split(" ")[0] || profile.name}.`);
          }}
        />
      );
    if (activeScreen === "home")
      return (
        <Home
          navigate={navigate}
          notify={notify}
          patient={selectedPatient}
          selectPatient={setSelectedPatient}
        />
      );
    if (activeScreen === "admin") return <Admin back={goBack} navigate={navigate} notify={notify} />;
    if (activeScreen === "log") return <Logbook navigate={navigate} notify={notify} />;
    if (activeScreen === "needs")
      return <Logbook initialSegment="needs" navigate={navigate} notify={notify} />;
    if (activeScreen === "notes") return <Notes navigate={navigate} notify={notify} />;
    if (activeScreen === "points") return <Points navigate={navigate} notify={notify} />;
    if (activeScreen === "profile")
      return (
        <Profile back={goBack} navigate={navigate} notify={notify} patient={selectedPatient} />
      );
    if (activeScreen === "family") return <Family back={goBack} navigate={navigate} />;
    if (activeScreen === "emergency") return <Emergency back={goBack} notify={notify} />;
    return <UtilityScreen kind={activeScreen} back={goBack} navigate={navigate} notify={notify} />;
  };
  const showNav = account
    ? ["home", "log", "needs", "notes", "points"].includes(activeScreen)
    : false;
  const activeTab = activeScreen === "needs" ? "log" : activeScreen;
  return (
    <div className="stage">
      <div className="app-shell">
        {render()}
        {showNav && <BottomNav active={activeTab} navigate={navigate} />}
        {toast && (
          <div className="toast">
            <Icon name="check" size={18} />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
