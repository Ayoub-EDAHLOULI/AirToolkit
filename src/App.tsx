import { HashRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import ComingSoon from "./components/ComingSoon";
import Home from "./pages/Home";
import JsonFormatter from "./pages/JsonFormatter";
import RegexTester from "./pages/RegexTester";
import { tools } from "./tools";
import "./App.css";

const BUILT_PATHS = ["/json", "/regex"];

export default function App() {
  return (
    <HashRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/regex" element={<RegexTester />} />
          {tools
            .filter((tool) => !BUILT_PATHS.includes(tool.path))
            .map((tool) => (
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
