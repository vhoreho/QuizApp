import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Просто логируем ошибку в консоль
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary p-4 border border-red-500 rounded bg-red-50">
          <h2 className="text-lg font-semibold text-red-700">
            Что-то пошло не так
          </h2>
          <p className="text-sm text-red-600 mt-1">
            Произошла ошибка при загрузке компонента. Пожалуйста, попробуйте
            перезагрузить страницу.
          </p>
          <button
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
