export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-primary/10 bg-white dark:bg-slate-950 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div id="about" className="space-y-2 scroll-mt-20">
            <h3 className="font-semibold text-foreground">About Beacon</h3>
            <p className="text-sm text-muted-foreground">
              Beacon is a comprehensive NGO management system designed to streamline campaign management, volunteer coordination, and donation tracking.
            </p>
          </div>

          {/* Contact Section */}
          <div id="contact" className="space-y-2 scroll-mt-20">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>📧 support@beacon.org</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>🏢 NGO Hub, City Center</li>
              <li>📍 123 Charity Lane, State</li>
            </ul>
          </div>

          {/* Support Section */}
          <div id="support" className="space-y-2 scroll-mt-20">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2026 Beacon NGO Management System. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Facebook
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
