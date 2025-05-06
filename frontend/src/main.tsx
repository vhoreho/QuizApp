import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProvider } from "@/contexts/UserContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { errorLogger } from "@/lib/errorLogger";
import App from "./App.tsx";
import "./styles/globals.css";
import { registerSW } from "virtual:pwa-register";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
    mutations: {
      onError: (error: unknown) => {
        if (error instanceof Error) {
          errorLogger.logError(error, {
            source: "react-query-mutation",
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  },
});

// Глобальный обработчик ошибок
const originalError = console.error;
console.error = (...args) => {
  if (args[0] instanceof Error) {
    errorLogger.logError(args[0], { source: "console-error" });
  } else if (typeof args[0] === "string") {
    errorLogger.logError(args[0], {
      args: args.slice(1),
      source: "console-error",
    });
  }
  originalError.apply(console, args);
};

// Регистрация сервис-воркера для PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Доступно новое обновление приложения. Обновить?")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("Приложение готово к работе в оффлайн режиме");
  },
});

// Глобальный обработчик необработанных ошибок JavaScript
window.addEventListener("error", (event) => {
  errorLogger.logError(event.error || event.message, {
    source: "window-error",
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Глобальный обработчик непойманных промисов
window.addEventListener("unhandledrejection", (event) => {
  const error =
    event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

  errorLogger.logError(error, {
    source: "unhandled-promise-rejection",
  });
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="system" storageKey="quiz-app-theme">
            <UserProvider>
              <App />
            </UserProvider>
          </ThemeProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
