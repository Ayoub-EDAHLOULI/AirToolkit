import { NavLink } from "react-router-dom";
import { Wrench, Moon, Sun } from "lucide-react";
import { tools } from "../tools";
import { useTheme } from "../theme/useTheme";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
          <Wrench className="text-primary w-6 h-6 mr-3" />
          <h1 className="text-lg font-bold text-text tracking-wide">
            AirToolkit
          </h1>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
          {tools.map((tool) => (
            <NavLink
              key={tool.path}
              to={tool.path}
              className={({ isActive }) =>
                `flex items-center w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg hover:text-text"
                }`
              }
            >
              <tool.icon size={18} className="mr-3 shrink-0" />
              <span className="truncate">{tool.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-subText hover:bg-inputBg hover:text-text transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={18} className="mr-3" />
            ) : (
              <Moon size={18} className="mr-3" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
