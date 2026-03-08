import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "This tool made debugging EDI claims incredibly simple. What used to take hours now takes minutes.",
    author: "Sarah Chen",
    role: "Healthcare Developer",
    company: "MedTech Solutions",
  },
  {
    quote: "The AI assistant understands EDI better than most analysts I've worked with. Game changer for our billing team.",
    author: "Marcus Johnson",
    role: "Billing Manager",
    company: "ClearPath Health",
  },
  {
    quote: "We reduced claim rejections by 60% in the first month. The fix assistant alone is worth the subscription.",
    author: "Priya Patel",
    role: "Director of IT",
    company: "Apex Insurance",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Trusted by Healthcare Professionals</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-6 leading-relaxed">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
