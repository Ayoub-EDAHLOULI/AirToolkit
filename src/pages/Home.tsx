import { Link } from "react-router-dom";
import { tools } from "../tools";

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <h2 className="text-2xl font-bold text-text mb-1">AirToolkit</h2>
      <p className="text-subText mb-6">
        Pick a tool from the sidebar to get started.
      </p>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
          >
            <tool.icon size={22} className="text-primary shrink-0" />
            <span className="font-medium text-text text-sm">{tool.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
