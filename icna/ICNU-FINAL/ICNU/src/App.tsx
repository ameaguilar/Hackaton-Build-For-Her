import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { Icon } from "./components/Icon";
import { usePersistentState } from "./lib/storage";
import Home from "./screens/Home";
import Admin from "./screens/Admin";
import { Logbook } from "./screens/Logbook";
import Notes from "./screens/Notes";
import WeeklySummary from "./screens/WeeklySummary";
import Profile from "./screens/Profile";
import Family from "./screens/Family";
import Emergency from "./screens/Emergency";
import UtilityScreen from "./screens/UtilityScreen";
import Welcome from "./screens/Welcome";
import AccountCreate from "./screens/AccountCreate";
import Patients from "./screens/Patients";
import { PatientScope } from "./lib/patientScope";
import type { AccountProfile, PatientId, Screen } from "./types";

export default function App() {
  const [account, setAccount] = usePersistentState<AccountProfile | null>("account:profile", null);
  const [session, setSession] = usePersistentState("account:active", true);
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
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const goBack = () => {
    const previous = history.at(-1) ?? (account ? "home" : "welcome");
    setHistory((current) => current.slice(0, -1));
    setScreen(previous);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const activeScreen: Screen =
    account && session ? screen : screen === "account-create" ? "account-create" : "welcome";
  const render = () => {
    if (activeScreen === "welcome")
      return (
        <Welcome
          navigate={navigate}
          account={account}
          resume={() => {
            setSession(true);
            setScreen("home");
            setHistory([]);
          }}
        />
      );
    if (activeScreen === "account-create")
      return (
        <AccountCreate
          navigate={navigate}
          notify={notify}
          onCreate={(profile) => {
            setAccount(profile);
            setSession(true);
            setHistory([]);
            setScreen("home");
            notify(`Perfil guardado. Bienvenido, ${profile.name.split(" ")[0] || profile.name}.`);
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
    if (activeScreen === "admin")
      return (
        <Admin
          back={goBack}
          navigate={navigate}
          notify={notify}
          logout={() => {
            setSession(false);
            setScreen("welcome");
            setHistory([]);
          }}
        />
      );
    if (activeScreen === "log" || activeScreen === "log-entry")
      return (
        <Logbook
          key={activeScreen}
          initialEntry={activeScreen === "log-entry"}
          navigate={navigate}
          notify={notify}
        />
      );
    if (activeScreen === "needs")
      return <Logbook initialSegment="needs" navigate={navigate} notify={notify} />;
    if (activeScreen === "notes") return <Notes navigate={navigate} notify={notify} />;
    if (activeScreen === "weekly-summary") return <WeeklySummary navigate={navigate} />;
    if (activeScreen === "profile")
      return (
        <Profile
          back={goBack}
          navigate={navigate}
          notify={notify}
          patient={selectedPatient}
          deleted={() => {
            setSelectedPatient("");
            setHistory([]);
            setScreen("home");
          }}
        />
      );
    if (activeScreen === "family") return <Family back={goBack} navigate={navigate} />;
    if (activeScreen === "emergency") return <Emergency back={goBack} notify={notify} />;
    if (activeScreen === "patient-create")
      return (
        <Patients
          back={goBack}
          notify={notify}
          open={(id) => {
            setSelectedPatient(id);
            navigate("profile");
          }}
        />
      );
    return (
      <UtilityScreen
        key={`${activeScreen}:${selectedPatient}`}
        kind={activeScreen}
        back={goBack}
        navigate={navigate}
        notify={notify}
      />
    );
  };
  const showNav =
    account && session
      ? ["home", "log", "log-entry", "needs", "notes", "weekly-summary"].includes(activeScreen)
      : false;
  const activeTab = activeScreen === "needs" || activeScreen === "log-entry" ? "log" : activeScreen;
  return (
    <div className="stage">
      <div className="app-shell">
        <PatientScope.Provider value={selectedPatient}>{render()}</PatientScope.Provider>
        {showNav && <BottomNav active={activeTab} navigate={navigate} />}
        {toast && (
          <div className="toast" role="status">
            <Icon name="check" size={18} />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
