import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}