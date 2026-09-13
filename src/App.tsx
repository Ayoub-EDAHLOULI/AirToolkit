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
import UrlTool from "./pages/UrlTool";
import CidrCalculator from "./pages/CidrCalculator";
import TextUtilities from "./pages/TextUtilities";
import PasswordChecker from "./pages/PasswordChecker";
import LogParser from "./pages/LogParser";
import DotenvDiff from "./pages/DotenvDiff";
import DataFormatConverter from "./pages/DataFormatConverter";
import StringEscape from "./pages/StringEscape";
import JsonDiff from "./pages/JsonDiff";
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
  "/url",
  "/cidr",
  "/text",
  "/password",
  "/log-parser",
  "/dotenv-diff",
  "/json-yaml",
  "/escape",
  "/json-diff",
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
          <Route path="/url" element={<UrlTool />} />
          <Route path="/cidr" element={<CidrCalculator />} />
          <Route path="/text" element={<TextUtilities />} />
          <Route path="/password" element={<PasswordChecker />} />
          <Route path="/log-parser" element={<LogParser />} />
          <Route path="/dotenv-diff" element={<DotenvDiff />} />
          <Route path="/json-yaml" element={<DataFormatConverter />} />
          <Route path="/escape" element={<StringEscape />} />
          <Route path="/json-diff" element={<JsonDiff />} />
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
