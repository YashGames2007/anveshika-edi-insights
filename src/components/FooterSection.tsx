import { Zap } from "lucide-react";

const links = {
  Product: ["Features", "Pricing", "Demo", "Changelog"],
  Resources: ["Documentation", "API Reference", "Blog", "Status"],
  Company: ["About", "Careers", "Contact", "Privacy Policy"],
};

const FooterSection = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Edi Parser</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered EDI parsing and validation for healthcare professionals.
            </p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/30 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Edi Parser. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
