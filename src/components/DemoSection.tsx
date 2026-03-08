import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Wrench, MessageSquare } from "lucide-react";

const sampleStructure = [
  {
    label: "ISA – Interchange Header",
    children: [
      {
        label: "GS – Functional Group",
        children: [
          {
            label: "ST – Transaction Set (837)",
            children: [
              { label: "BHT – Beginning of Transaction" },
              {
                label: "Loop 2000A – Billing Provider",
                children: [
                  { label: "NM1 – Provider Name" },
                  { label: "N3 – Address" },
                  { label: "N4 – City/State/ZIP" },
                ],
              },
              {
                label: "Loop 2000B – Subscriber",
                children: [
                  { label: "NM1 – Subscriber Name" },
                  { label: "DMG – Demographics" },
                ],
              },
              {
                label: "Loop 2300 – Claim",
                children: [
                  { label: "CLM – Claim Information", hasError: true },
                  { label: "DTP – Service Date" },
                  {
                    label: "Loop 2400 – Service Lines",
                    children: [
                      { label: "SV1 – Professional Service" },
                      { label: "DTP – Service Date" },
                    ],
                  },
                ],
              },
            ],
          },
          { label: "SE – Transaction Set Trailer" },
        ],
      },
      { label: "GE – Functional Group Trailer" },
    ],
  },
  { label: "IEA – Interchange Trailer" },
];

const errors = [
  { loop: "Loop 2300", segment: "CLM", element: "CLM02", description: "Claim amount mismatch – expected numeric value", fix: "Replace 'ABC' with '1500.00'" },
  { loop: "Loop 2000A", segment: "N4", element: "N403", description: "Invalid ZIP code format", fix: "Change '9410' to '94102'" },
  { loop: "Loop 2400", segment: "SV1", element: "SV102", description: "Missing procedure code modifier", fix: "Add modifier '25' after procedure code" },
];

interface TreeNodeProps {
  node: { label: string; children?: TreeNodeProps["node"][]; hasError?: boolean };
  depth?: number;
}

const TreeNode = ({ node, depth = 0 }: TreeNodeProps) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center gap-1.5 w-full text-left py-1 px-2 rounded text-sm hover:bg-muted/50 transition-colors ${
          node.hasError ? "text-destructive" : "text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="font-mono text-xs">{node.label}</span>
        {node.hasError && <AlertCircle className="w-3 h-3 text-destructive shrink-0 ml-1" />}
      </button>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children!.map((child, i) => (
              <TreeNode key={i} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DemoSection = () => {
  const [activeTab, setActiveTab] = useState<"structure" | "errors" | "assistant">("structure");
  const [uploaded, setUploaded] = useState(false);

  return (
    <section id="demo" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Interactive Demo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">See It in Action</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experience the full EDI analysis workflow with our interactive demo.
          </p>
        </motion.div>

        {!uploaded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <button
              onClick={() => setUploaded(true)}
              className="w-full glass-card p-12 flex flex-col items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold mb-1">Drag & Drop EDI File</p>
                <p className="text-xs text-muted-foreground">Supports .edi, .txt, .dat, .x12 files</p>
              </div>
              <span
                className="px-5 py-2 rounded-lg text-primary-foreground text-sm font-medium"
                style={{ background: "var(--gradient-primary)" }}
              >
                Load Sample 837 File
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* File info bar */}
            <div className="glass-card p-4 mb-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">sample_837_claim.edi</span>
              </div>
              <span className="text-muted-foreground">Type: <span className="text-accent">837 Professional</span></span>
              <span className="text-muted-foreground">Version: <span className="text-foreground">005010X222A1</span></span>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1 text-destructive text-xs"><AlertCircle className="w-3 h-3" /> 3 Errors</span>
                <span className="flex items-center gap-1 text-accent text-xs"><CheckCircle className="w-3 h-3" /> 42 Segments</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
              {([
                { key: "structure" as const, label: "Structure", icon: ChevronRight },
                { key: "errors" as const, label: "Errors (3)", icon: AlertCircle },
                { key: "assistant" as const, label: "AI Assistant", icon: MessageSquare },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="glass-card overflow-hidden" style={{ minHeight: 400 }}>
              <AnimatePresence mode="wait">
                {activeTab === "structure" && (
                  <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">EDI Structure Tree — click to expand/collapse</p>
                    {sampleStructure.map((node, i) => (
                      <TreeNode key={i} node={node} />
                    ))}
                  </motion.div>
                )}

                {activeTab === "errors" && (
                  <motion.div key="errors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b border-border">
                          <th className="pb-2 pr-4">Loop</th>
                          <th className="pb-2 pr-4">Segment</th>
                          <th className="pb-2 pr-4">Element</th>
                          <th className="pb-2 pr-4">Description</th>
                          <th className="pb-2">Fix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((err, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 pr-4 text-foreground font-mono text-xs">{err.loop}</td>
                            <td className="py-3 pr-4 text-destructive font-mono text-xs">{err.segment}</td>
                            <td className="py-3 pr-4 text-foreground font-mono text-xs">{err.element}</td>
                            <td className="py-3 pr-4 text-muted-foreground text-xs">{err.description}</td>
                            <td className="py-3">
                              <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                                <Wrench className="w-3 h-3" />
                                Fix
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {activeTab === "assistant" && (
                  <motion.div key="assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 flex flex-col" style={{ minHeight: 360 }}>
                    <div className="flex-1 space-y-4 mb-4">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="glass-card p-3 text-sm text-muted-foreground max-w-md">
                          I found 3 errors in your 837 claim file. The most critical is a claim amount mismatch in CLM02. Would you like me to explain each error?
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-foreground max-w-md">
                          What does CLM02 mean and how do I fix it?
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="glass-card p-3 text-sm text-muted-foreground max-w-md">
                          <strong className="text-foreground">CLM02</strong> is the Total Claim Charge Amount in the CLM segment. It must be a valid numeric value representing the total billed amount. Your file has 'ABC' which is non-numeric. Replace it with the correct amount, e.g., <code className="text-accent">1500.00</code>.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask about any segment, error, or rejection code..."
                        className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button className="px-4 py-2.5 rounded-lg text-primary-foreground text-sm font-medium shrink-0" style={{ background: "var(--gradient-primary)" }}>
                        Send
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default DemoSection;
