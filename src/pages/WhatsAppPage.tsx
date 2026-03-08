import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Search, Phone, Plus, Check, CheckCheck, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mockWhatsAppMessages } from "@/lib/mock-whatsapp";
import { WhatsAppMessage } from "@/lib/whatsapp-types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Contact {
  phone: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const STATUS_ICONS: Record<string, any> = {
  sent: Clock,
  delivered: Check,
  read: CheckCheck,
};

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockWhatsAppMessages);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  // Derive contacts from messages
  const contactMap = new Map<string, Contact>();
  [...messages].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).forEach(m => {
    if (!contactMap.has(m.phone)) {
      contactMap.set(m.phone, {
        phone: m.phone,
        name: m.phone, // In real app, resolve from records
        lastMessage: m.message,
        lastTime: m.sentAt,
        unread: 0,
      });
    }
  });
  const contacts = Array.from(contactMap.values()).filter(c =>
    c.phone.includes(search) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const chatMessages = selectedPhone
    ? messages.filter(m => m.phone === selectedPhone).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    : [];

  const handleSend = () => {
    if (!draft.trim() || !selectedPhone) return;
    const newMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`, tenantId: 't1', recordId: '',
      phone: selectedPhone, message: draft,
      status: 'sent', sentAt: new Date().toISOString(),
    };
    setMessages([...messages, newMsg]);
    setDraft("");
  };

  const handleNewChat = () => {
    if (!newPhone.trim()) return;
    const firstMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`, tenantId: 't1', recordId: '',
      phone: newPhone, message: `Chat started with ${newName || newPhone}`,
      status: 'sent', sentAt: new Date().toISOString(),
    };
    setMessages([...messages, firstMsg]);
    setSelectedPhone(newPhone);
    setNewPhone(""); setNewName("");
    setNewChatOpen(false);
    toast.success("Chat started");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Contact List */}
      <div className={`${selectedPhone ? 'hidden lg:flex' : 'flex'} flex-col w-80 border-r border-border bg-card shrink-0`}>
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
            <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Chat</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label>Phone Number</Label><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1 555-0000" className="mt-1" /></div>
                  <div><Label>Name (optional)</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Contact name" className="mt-1" /></div>
                  <Button onClick={handleNewChat} className="w-full gradient-brand text-primary-foreground">Start Chat</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {contacts.length === 0 ? (
            <div className="py-16 text-center">
              <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No conversations</p>
            </div>
          ) : (
            contacts.map((contact, i) => (
              <motion.button
                key={contact.phone}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPhone(contact.phone)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors text-left ${
                  selectedPhone === contact.phone ? 'bg-primary/5' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatDistanceToNow(new Date(contact.lastTime), { addSuffix: true })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
              </motion.button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedPhone ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSelectedPhone(null)}>
              <Phone className="h-4 w-4" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedPhone}</p>
              <p className="text-[11px] text-emerald-600">Online</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-muted/20">
            <div className="max-w-2xl mx-auto space-y-3">
              {chatMessages.map(msg => {
                const StatusIcon = STATUS_ICONS[msg.status] || Clock;
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
                      <p className="text-sm text-foreground">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusIcon className={`h-3 w-3 ${msg.status === 'read' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      </div>
                      {msg.template && <Badge variant="outline" className="text-[9px] mt-1">Template: {msg.template}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} className="gradient-brand text-primary-foreground shrink-0" disabled={!draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
