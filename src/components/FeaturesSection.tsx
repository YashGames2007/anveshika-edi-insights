import { motion } from "framer-motion";
import { Shield, Zap, Wrench, TreePine, Brain, HeartPulse } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "AI-Powered Validation",
    description: "Intelligent validation engine that catches errors traditional parsers miss, with context-aware healthcare rules.",
  },
  {
    icon: Zap,
    title: "Real-Time Error Detection",
    description: "Instantly identify issues in your EDI files with detailed error locations and severity classifications.",
  },
  {
    icon: Wrench,
    title: "Fix Assistant",
    description: "One-click fixes for common EDI errors. The system suggests corrections and applies them instantly.",
  },
  {
    icon: TreePine,
    title: "Interactive Structure Viewer",
    description: "Navigate your EDI file like a code explorer. Expand loops, inspect segments, and understand the hierarchy.",
  },
  {
    icon: Brain,
    title: "AI Explanation Engine",
    description: "Ask questions about any segment, error, or rejection code. Get clear, actionable explanations.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare EDI Support",
    description: "Full support for 837 claims, 835 remittance, and 834 enrollment files with transaction-specific insights.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need for EDI Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From parsing to fixing, Anveshika provides a complete toolkit for healthcare EDI professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card p-6 group hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
