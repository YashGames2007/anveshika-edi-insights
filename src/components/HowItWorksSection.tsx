import { motion } from "framer-motion";
import { Upload, FileSearch, AlertTriangle, Brain, CheckCircle } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload EDI File", description: "Drag & drop your .edi, .txt, .dat, or .x12 file" },
  { icon: FileSearch, title: "Parse Structure", description: "System parses loops, segments, and elements" },
  { icon: AlertTriangle, title: "Detect Errors", description: "Validation engine identifies all issues" },
  { icon: Brain, title: "AI Explains", description: "Get clear explanations for every error" },
  { icon: CheckCircle, title: "Fix Instantly", description: "Apply suggested corrections with one click" },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Five simple steps from upload to a fully validated, error-free EDI file.
          </p>
        </motion.div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex-1 text-center"
            >
              <div className="relative z-10 mx-auto w-14 h-14 rounded-full border-2 border-primary/50 bg-background flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-medium text-primary mb-1">Step {i + 1}</p>
              <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
