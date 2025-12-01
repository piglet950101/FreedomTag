import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, Ticket, Users, Bot, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WhatsAppDemo() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const { toast } = useToast();

  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/whatsapp/contacts'],
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/whatsapp/conversations'],
  });

  // Fetch messages for active conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/whatsapp/messages', activeConversation],
    enabled: !!activeConversation,
  });

  // Fetch tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['/api/whatsapp/tickets'],
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; name: string }) => {
      const res = await apiRequest('POST', '/api/whatsapp/contacts', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/contacts'] });
      setNewContactName('');
      setNewContactPhone('');
      setShowNewContact(false);
      toast({ title: 'Contact created successfully' });
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const res = await apiRequest('POST', '/api/whatsapp/conversations', { contactId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/conversations'] });
      setActiveConversation(data.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string; sender: string }) => {
      const res = await apiRequest('POST', '/api/whatsapp/messages', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages', activeConversation] });
      setMessageContent('');
    },
  });

  // AI chatbot mutation
  const chatbotMutation = useMutation({
    mutationFn: async (data: { conversationId: string; userMessage: string }) => {
      const res = await apiRequest('POST', '/api/whatsapp/chatbot', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages', activeConversation] });
    },
  });

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !activeConversation) return;

    // Send user message
    await sendMessageMutation.mutateAsync({
      conversationId: activeConversation,
      content: messageContent,
      sender: 'user',
    });

    // Trigger AI bot response
    await chatbotMutation.mutateAsync({
      conversationId: activeConversation,
      userMessage: messageContent,
    });
  };

  const handleCreateContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    createContactMutation.mutate({
      phoneNumber: newContactPhone,
      name: newContactName,
    });
  };

  const activeConversationData = conversations.find((c: any) => c.id === activeConversation);
  const activeContact = activeConversationData
    ? contacts.find((c: any) => c.id === activeConversationData.contactId)
    : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card p-4" data-testid="header-whatsapp-demo">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-title">WhatsApp Business API Demo</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
              Interactive chatbot, ticketing system & CRM
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex gap-4">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-tickets">
              <Ticket className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="crm" data-testid="tab-crm">
              <Users className="w-4 h-4 mr-2" />
              CRM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex gap-4 mt-0">
            {/* Conversations List */}
            <Card className="w-80 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-conversations">
                      No conversations yet
                    </p>
                  ) : (
                    conversations.map((conv: any) => {
                      const contact = contacts.find((c: any) => c.id === conv.contactId);
                      return (
                        <Button
                          key={conv.id}
                          variant={activeConversation === conv.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setActiveConversation(conv.id)}
                          data-testid={`conversation-${conv.id}`}
                        >
                          <User className="w-4 h-4 mr-2" />
                          <span className="truncate">{contact?.name || 'Unknown'}</span>
                        </Button>
                      );
                    })
                  )}
                </CardContent>
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {activeContact?.name || 'Unknown Contact'}
                      <Badge variant="outline" className="ml-auto">
                        <Bot className="w-3 h-3 mr-1" />
                        AI Assistant Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div
                            className={`max-w-sm p-3 rounded-lg ${
                              msg.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : msg.sender === 'bot'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.sender === 'bot' && (
                              <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                                <Bot className="w-3 h-3" />
                                AI Assistant
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      data-testid="button-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground" data-testid="empty-chat-area">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p data-testid="text-select-conversation">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="flex-1 mt-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-5rem)]">
                <CardContent className="space-y-3">
                  {tickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-tickets">
                      No tickets yet
                    </p>
                  ) : (
                    tickets.map((ticket: any) => (
                      <Card key={ticket.id} data-testid={`ticket-${ticket.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{ticket.subject}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.ticketNumber}
                              </p>
                            </div>
                            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{ticket.description}</p>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">{ticket.priority} priority</Badge>
                            <p className="text-xs text-muted-foreground ml-auto">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="crm" className="flex-1 mt-0">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Contact Management</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNewContact(!showNewContact)}
                  data-testid="button-add-contact"
                >
                  {showNewContact ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-5rem)]">
                <CardContent className="space-y-3">
                  {showNewContact && (
                    <Card className="bg-accent">
                      <CardContent className="pt-4 space-y-3">
                        <Input
                          placeholder="Contact Name"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          data-testid="input-contact-name"
                        />
                        <Input
                          placeholder="Phone Number"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          data-testid="input-contact-phone"
                        />
                        <Button
                          className="w-full"
                          onClick={handleCreateContact}
                          disabled={createContactMutation.isPending}
                          data-testid="button-create-contact"
                        >
                          Create Contact
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  {contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-contacts">
                      No contacts yet
                    </p>
                  ) : (
                    contacts.map((contact: any) => (
                      <Card key={contact.id} data-testid={`contact-${contact.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{contact.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const existingConvo = conversations.find(
                                  (c: any) => c.contactId === contact.id
                                );
                                if (existingConvo) {
                                  setActiveConversation(existingConvo.id);
                                } else {
                                  createConversationMutation.mutate(contact.id);
                                }
                              }}
                              data-testid={`button-chat-${contact.id}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {contact.notes && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{contact.notes}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
