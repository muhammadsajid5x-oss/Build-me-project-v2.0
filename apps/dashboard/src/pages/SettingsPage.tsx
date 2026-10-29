import { useTheme } from "../services/themeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">Appearance settings.</p>

      <div className="mt-6 p-4 border border-gray-700 rounded-lg max-w-md">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex items-center justify-between pt-2">
          <span className="text-gray-300">Theme</span>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              theme === "light"
                ? "bg-gray-700 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>
      </div>
    </section>
  );
}