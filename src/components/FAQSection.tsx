import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "What EDI formats are supported?",
    a: "This Edi Parser supports all major healthcare EDI X12 transaction sets including 837 (Claims), 835 (Remittance Advice), and 834 (Enrollment). We support versions 4010 and 5010.",
  },
  {
    q: "Is healthcare data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest. We are HIPAA compliant and never store your EDI files permanently. Files are processed in memory and discarded after analysis.",
  },
  {
    q: "How accurate is the validation engine?",
    a: "Our AI-powered validation engine catches 99.2% of common EDI errors and continuously improves through machine learning. It validates against both syntax rules and healthcare-specific business rules.",
  },
  {
    q: "Can I export validation reports?",
    a: "Yes. You can export reports as PDF with highlighted errors, download error-only summaries, or export the full file with annotations. Reports can be shared with team members directly.",
  },
  {
    q: "Does this Edi Parser offer an API?",
    a: "Enterprise plans include full REST API access for batch processing, integration with your existing workflows, and webhook notifications for automated validation pipelines.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="section-container relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-border/50">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
