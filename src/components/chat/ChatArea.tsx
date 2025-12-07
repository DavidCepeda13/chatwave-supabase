import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
  onStartBranding?: () => void;
}

export function ChatArea({ messages, isLoading, streamingContent, onStartBranding }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            ¿En qué puedo ayudarte?
          </h2>
          <p className="text-muted-foreground mb-6">
            Escribe un mensaje o sube una imagen para comenzar una conversación con la IA.
          </p>
          
          {onStartBranding && (
            <div className="mt-8 p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Asistente de Branding</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Inicia un flujo guiado de 24 preguntas para crear el perfil completo de tu marca.
              </p>
              <Button
                onClick={onStartBranding}
                className="w-full"
                variant="default"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Iniciar Cuestionario de Branding
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            images={message.images}
          />
        ))}
        
        {streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
          />
        )}
        
        {isLoading && !streamingContent && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
