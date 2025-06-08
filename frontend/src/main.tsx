import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProvider } from "@/contexts/UserContext";
import ErrorBoundary from "@/components/ErrorBoundary";
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
          console.error("React Query Mutation Error:", error);
        }
      },
    },
  },
});

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
  console.error("Unhandled window error:", {
    message: event.error?.message || event.message,
    stack: event.error?.stack,
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

  console.error("Unhandled promise rejection:", error);
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
