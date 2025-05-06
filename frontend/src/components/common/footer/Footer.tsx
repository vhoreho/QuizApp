export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Quiz App. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  </footer>
);
