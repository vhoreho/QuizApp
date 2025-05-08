import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Приложение для тестирования. Все права
            защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
