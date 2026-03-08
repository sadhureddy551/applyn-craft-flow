import { useState, useCallback } from 'react';
import { WhatsAppMessage } from '@/lib/whatsapp-types';
import { mockWhatsAppMessages } from '@/lib/mock-whatsapp';

export function useWhatsApp(recordId: string) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(
    mockWhatsAppMessages.filter((m) => m.recordId === recordId)
  );

  const sendMessage = useCallback((phone: string, message: string, template?: string) => {
    const newMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`,
      tenantId: 't1',
      recordId,
      phone,
      message,
      template,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMsg, ...prev]);
    return newMsg;
  }, [recordId]);

  return { messages, sendMessage };
}
