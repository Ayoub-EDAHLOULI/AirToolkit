import { HashRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import ComingSoon from "./components/ComingSoon";
import Home from "./pages/Home";
import JsonFormatter from "./pages/JsonFormatter";
import RegexTester from "./pages/RegexTester";
import EncodeDecode from "./pages/EncodeDecode";
import HashUuid from "./pages/HashUuid";
import JwtDecoder from "./pages/JwtDecoder";
import DiffTool from "./pages/DiffTool";
import TimestampConverter from "./pages/TimestampConverter";
import CaseConverter from "./pages/CaseConverter";
import NumberBaseConverter from "./pages/NumberBaseConverter";
import XmlCsvFormatter from "./pages/XmlCsvFormatter";
import ColorTools from "./pages/ColorTools";
import MarkdownPreviewer from "./pages/MarkdownPreviewer";
import SqlFormatter from "./pages/SqlFormatter";
import FakeDataGenerator from "./pages/FakeDataGenerator";
import QrCodeGenerator from "./pages/QrCodeGenerator";
import CronExplainer from "./pages/CronExplainer";
import CertDecoder from "./pages/CertDecoder";
import FaviconGenerator from "./pages/FaviconGenerator";
import PaletteExtractor from "./pages/PaletteExtractor";
import QrCodeReader from "./pages/QrCodeReader";
import ApiTester from "./pages/ApiTester";
import { tools } from "./tools";
import "./App.css";

const BUILT_PATHS = [
  "/json",
  "/regex",
  "/encode",
  "/hash",
  "/jwt",
  "/diff",
  "/timestamp",
  "/case",
  "/base",
  "/xml-csv",
  "/color",
  "/markdown",
  "/sql",
  "/fake-data",
  "/qr",
  "/cron",
  "/cert",
  "/favicon",
  "/palette",
  "/qr-reader",
  "/api-tester",
];

export default function App() {
  return (
    <HashRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/regex" element={<RegexTester />} />
          <Route path="/encode" element={<EncodeDecode />} />
          <Route path="/hash" element={<HashUuid />} />
          <Route path="/jwt" element={<JwtDecoder />} />
          <Route path="/diff" element={<DiffTool />} />
          <Route path="/timestamp" element={<TimestampConverter />} />
          <Route path="/case" element={<CaseConverter />} />
          <Route path="/base" element={<NumberBaseConverter />} />
          <Route path="/xml-csv" element={<XmlCsvFormatter />} />
          <Route path="/color" element={<ColorTools />} />
          <Route path="/markdown" element={<MarkdownPreviewer />} />
          <Route path="/sql" element={<SqlFormatter />} />
          <Route path="/fake-data" element={<FakeDataGenerator />} />
          <Route path="/qr" element={<QrCodeGenerator />} />
          <Route path="/cron" element={<CronExplainer />} />
          <Route path="/cert" element={<CertDecoder />} />
          <Route path="/favicon" element={<FaviconGenerator />} />
          <Route path="/palette" element={<PaletteExtractor />} />
          <Route path="/qr-reader" element={<QrCodeReader />} />
          <Route path="/api-tester" element={<ApiTester />} />
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
