import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DotLoader } from "@/components/ui/dot-loader";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/api/config";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text: "Welcome to Luxe! I am your personal shopping assistant. Ask me about products and I will help you find exactly what you are looking for.",
  products: [],
  cartProducts: [],
  compareProducts: [],
  streaming: false,
  timestamp: new Date(),
};

const SUGGESTED_QUERIES = [
  "Show me featured jewelry",
  "Find electronics under $500",
  "What fragrances do you have?",
  "Recommend clothing for men",
];

const getOrCreateSessionId = () => {
  let id = sessionStorage.getItem("chatSessionId");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("chatSessionId", id); }
  return id;
};

function ComparisonTable({ products }) {
  if (!products || products.length !== 2) return null;
  const [a, b] = products;
  const rows = [
    { label: "Price", va: `$${a.price?.toFixed(2)}`, vb: `$${b.price?.toFixed(2)}` },
    { label: "Category", va: a.category, vb: b.category },
    { label: "Sizes", va: a.sizes?.join(", ") || a.shoeSizes?.join(", ") || "—", vb: b.sizes?.join(", ") || b.shoeSizes?.join(", ") || "—" },
    { label: "Featured", va: a.isFeatured ? "Yes" : "No", vb: b.isFeatured ? "Yes" : "No" },
  ];
  return (
    <div className="mt-2 rounded-lg border border-primary/20 overflow-hidden text-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="py-2 text-[10px] uppercase tracking-wider w-1/4">Feature</TableHead>
            <TableHead className="py-2 text-primary text-[11px]">{a.name}</TableHead>
            <TableHead className="py-2 text-[11px]">{b.name}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="py-1.5 text-[10px] text-muted-foreground font-semibold">{row.label}</TableCell>
              <TableCell className="py-1.5 text-[11px]">{row.va}</TableCell>
              <TableCell className="py-1.5 text-[11px]">{row.vb}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const userScrolledUp = useRef(false);
  const sessionId = useRef(getOrCreateSessionId());
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    userScrolledUp.current = !atBottom;
  };

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleCartAdd = (product) => {
    addToCart(product, null);
    toast.success(`${product.name} added to cart`);
  };

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const userMsg = { id: Date.now().toString(), role: "user", text: messageText, products: [], cartProducts: [], compareProducts: [], streaming: false, timestamp: new Date() };
    const streamId = (Date.now() + 1).toString();
    const streamingMsg = { id: streamId, role: "assistant", text: "", products: [], cartProducts: [], compareProducts: [], streaming: true, timestamp: new Date() };

    setMessages((prev) => [...prev, userMsg, streamingMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: messageText, sessionId: sessionId.current }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "token") {
              setMessages((prev) => prev.map((m) => m.id === streamId ? { ...m, text: m.text + data.content } : m));
            } else if (data.type === "done") {
              setMessages((prev) => prev.map((m) => m.id === streamId ? {
                ...m,
                streaming: false,
                products: data.products || [],
                cartProducts: data.cartProducts || [],
                compareProducts: data.compareProducts || [],
              } : m));
            } else if (data.type === "error") {
              setMessages((prev) => prev.map((m) => m.id === streamId ? { ...m, streaming: false, text: "Sorry, I encountered an error. Please try again." } : m));
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages((prev) => prev.map((m) => m.id === streamId ? { ...m, streaming: false, text: "Connection error. Please try again." } : m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
        )}
        aria-label="Toggle chat"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
          style={{ height: "540px" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/90 backdrop-blur-sm">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Luxe Assistant</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                Online
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-3 overscroll-contain">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn("max-w-[85%] space-y-2", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}>
                      {msg.streaming ? (
                        <DotLoader size="sm" />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>

                    {/* Comparison table */}
                    {msg.compareProducts?.length === 2 && (
                      <ComparisonTable products={msg.compareProducts} />
                    )}

                    {/* Product grid */}
                    {msg.products?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.products.slice(0, 4).map((p) => (
                          <ProductCard key={p._id} product={p} compact />
                        ))}
                      </div>
                    )}

                    {/* Cart add buttons */}
                    {msg.cartProducts?.length > 0 && (
                      <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quick Add</p>
                        {msg.cartProducts.map((product) => (
                          <div key={product._id} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-foreground truncate">
                              <span className="text-primary font-medium">{product.name}</span>
                              {" "}— ${product.price?.toFixed(2)}
                            </span>
                            <Button size="sm" className="h-6 px-2 text-[10px] shrink-0" onClick={() => handleCartAdd(product)}>
                              <ShoppingBag className="h-3 w-3 mr-1" />Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested queries (only when no conversation yet) */}
            {messages.length === 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products..."
                disabled={loading}
                className="h-9 text-sm"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
