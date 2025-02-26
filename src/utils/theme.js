export const updateThemeColor = (tab) => {
  const colors = {
    dashboard: "#6366f1",
    expenses: "#ef4444",
    reports: "#10b981",
    settings: "#64748b",
  };

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", colors[tab] || colors.dashboard);
  }
};
