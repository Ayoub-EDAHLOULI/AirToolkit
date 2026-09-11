import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Wrench, Moon, Sun, Search, X } from "lucide-react";
import { tools, CATEGORIES } from "../tools";
import { useTheme } from "../theme/useTheme";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");

  const groupedTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? tools.filter((tool) => tool.label.toLowerCase().includes(normalized))
      : tools;

    return CATEGORIES.map((category) => ({
      category,
      items: filtered.filter((tool) => tool.category === category),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const hasResults = groupedTools.length > 0;

  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <Link
          to="/"
          className="h-16 flex items-center px-5 border-b border-border shrink-0 hover:bg-inputBg transition-colors"
        >
          <Wrench className="text-primary w-6 h-6 mr-3" />
          <h1 className="text-lg font-bold text-text tracking-wide">
            AirToolkit
          </h1>
        </Link>

        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subText pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-inputBg pl-8 pr-8 py-1.5 text-sm text-text outline-none placeholder:text-subText"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-subText hover:text-text transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 py-2 flex flex-col overflow-y-auto custom-scrollbar">
          {!hasResults && (
            <p className="px-4 py-3 text-sm text-subText">No tools found.</p>
          )}

          {groupedTools.map((group) => (
            <div key={group.category} className="px-3 py-2">
              <h2 className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-subText">
                {group.category}
              </h2>
              <div className="flex flex-col gap-1">
                {group.items.map((tool) => (
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
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
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
