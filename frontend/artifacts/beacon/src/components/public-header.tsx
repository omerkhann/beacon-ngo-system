import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logos/logo.png";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/15">
              <img src={logoImage} alt="Beacon Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Beacon</h1>
              <p className="text-xs text-white/80">NGO Management System</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-colors"
              onClick={() => {
                // Scroll to About section if on same page, or navigate
                const element = document.getElementById("about");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              About
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-colors"
              onClick={() => {
                const element = document.getElementById("contact");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Contact
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-colors"
              onClick={() => {
                const element = document.getElementById("support");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Support
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
