import { HashRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import ComingSoon from "./components/ComingSoon";
import Home from "./pages/Home";
import { tools } from "./tools";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          {tools.map((tool) => (
            <Route
              key={tool.path}
              path={tool.path}
              element={<ComingSoon icon={tool.icon} label={tool.label} />}
            />
          ))}
        </Routes>
      </SidebarLayout>
    </HashRouter>
  );
}
