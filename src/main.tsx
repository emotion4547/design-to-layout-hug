import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// HelmetProvider убран: head-теги проставляет components/SEO.tsx напрямую,
// react-helmet-async в production-сборке не отрабатывал на lazy-страницах.
createRoot(document.getElementById("root")!).render(<App />);
