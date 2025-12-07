import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

interface BrandingData {
  nombre_marca?: string;
  oferta_valor?: string;
  perfil_cliente?: string;
  valores_marca?: string;
  personalidad_marca?: string;
  tono_voz?: string;
  colores_identidad?: string;
  estilo_visual?: string;
  objetivo_principal?: string;
  diferenciador?: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isBrandingMode, setIsBrandingMode] = useState(false);
  const [brandingData, setBrandingData] = useState<BrandingData>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [brandingComplete, setBrandingComplete] = useState(false);

  // Define essential branding questions (reduced to 10 core questions)
  const brandingQuestions = [
    { key: "nombre_marca", question: "¿Cómo se llama tu marca?", path: ["nombre_marca"] },
    { key: "oferta_valor", question: "¿Qué problema resuelves o qué beneficio ofreces a tus clientes?", path: ["oferta_valor"] },
    { key: "perfil_cliente", question: "Describe a tu cliente ideal (edad, intereses, necesidades principales).", path: ["perfil_cliente"] },
    { key: "valores_marca", question: "¿Cuáles son los 3 valores fundamentales de tu marca?", path: ["valores_marca"] },
    { key: "personalidad_marca", question: "Si tu marca fuera una persona, ¿cómo sería? (formal/casual, tradicional/moderna, divertida/seria)", path: ["personalidad_marca"] },
    { key: "tono_voz", question: "¿Qué tono de comunicación prefieres? (profesional, amigable, inspirador, técnico)", path: ["tono_voz"] },
    { key: "colores_identidad", question: "¿Qué colores representan mejor tu marca? (máximo 3)", path: ["colores_identidad"] },
    { key: "estilo_visual", question: "¿Qué estilo visual prefieres? (minimalista, moderno, clásico, audaz)", path: ["estilo_visual"] },
    { key: "objetivo_principal", question: "¿Cuál es tu objetivo principal con esta marca? (ventas, reconocimiento, comunidad, educar)", path: ["objetivo_principal"] },
    { key: "diferenciador", question: "¿Qué hace única a tu marca? ¿Por qué deberían elegirte?", path: ["diferenciador"] }
  ];

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return;
    }

    setChats(data || []);
    
    if (data && data.length > 0 && !activeChat) {
      setActiveChat(data[0].id);
    }
  }, [user, activeChat]);

  // Fetch messages for active chat
  const fetchMessages = useCallback(async () => {
    if (!activeChat || !user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", activeChat)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Fetch images for messages
    const messagesWithImages: Message[] = await Promise.all(
      (data || []).map(async (msg) => {
        if (msg.role === "user") {
          const { data: imageData } = await supabase
            .from("uploaded_images")
            .select("file_path")
            .eq("message_id", msg.id);

          const images = imageData?.map((img) => {
            const { data: urlData } = supabase.storage
              .from("chat-images")
              .getPublicUrl(img.file_path);
            return urlData.publicUrl;
          });

          return { id: msg.id, role: msg.role as "user" | "assistant", content: msg.content, images };
        }
        return { id: msg.id, role: msg.role as "user" | "assistant", content: msg.content };
      })
    );

    setMessages(messagesWithImages);
  }, [activeChat, user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Start branding questionnaire
  const startBrandingQuestionnaire = async () => {
    if (!activeChat) return;
    
    setIsBrandingMode(true);
    setCurrentQuestionIndex(0);
    setBrandingData({});
    setBrandingComplete(false);
    setIsLoading(true);

    try {
      const firstQuestion = brandingQuestions[0];
      
      // Save assistant's first question
      const { data: assistantMsg, error } = await supabase
        .from("messages")
        .insert({
          chat_id: activeChat,
          user_id: user!.id,
          role: "assistant",
          content: `**Cuestionario de Branding** (Pregunta 1 de ${brandingQuestions.length})\n\n${firstQuestion.question}`,
        })
        .select()
        .single();

      if (!error && assistantMsg) {
        setMessages([{ 
          id: assistantMsg.id, 
          role: "assistant", 
          content: `**Cuestionario de Branding** (Pregunta 1 de ${brandingQuestions.length})\n\n${firstQuestion.question}`
        }]);
      }
    } catch (error) {
      console.error("Error starting questionnaire:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el cuestionario",
        variant: "destructive",
      });
      setIsBrandingMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat
  const handleNewChat = async () => {
    if (!user) return;

    setIsCreatingChat(true);

    try {
      // Create the chat
      const { data, error } = await supabase
        .from("chats")
        .insert({ 
          user_id: user.id, 
          title: "Nuevo chat" 
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el chat",
          variant: "destructive",
        });
        return;
      }

      setChats([data, ...chats]);
      setActiveChat(data.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el chat",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el chat",
        variant: "destructive",
      });
      return;
    }

    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);

    if (activeChat === chatId) {
      setActiveChat(updatedChats[0]?.id || null);
      setMessages([]);
    }
  };

  // Upload images to storage
  const uploadImages = async (files: File[], messageId: string, chatId: string) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${chatId}/${messageId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // Save image record
      await supabase.from("uploaded_images").insert({
        user_id: user!.id,
        message_id: messageId,
        chat_id: chatId,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
      });

      const { data: urlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  // Send message
  const handleSend = async (content: string, images: File[]) => {
    if (!user || !activeChat) {
      // Create new chat if none exists
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({ user_id: user!.id, title: content.slice(0, 50) || "Chat con imagen" })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el chat",
          variant: "destructive",
        });
        return;
      }

      setChats([newChat, ...chats]);
      setActiveChat(newChat.id);
      
      // Continue with the new chat ID
      await sendMessageToChat(newChat.id, content, images);
    } else {
      await sendMessageToChat(activeChat, content, images);
    }
  };

  const sendMessageToChat = async (chatId: string, content: string, images: File[]) => {
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Save user message
      const { data: userMsg, error: userMsgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: user!.id,
          role: "user",
          content: content || "(imagen)",
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images, userMsg.id, chatId);
      }

      // Add user message to UI immediately
      setMessages((prev) => [
        ...prev,
        { id: userMsg.id, role: "user", content: content || "(imagen)", images: imageUrls },
      ]);

      // Update chat title if it's the first message
      if (messages.length === 0 && content) {
        await supabase
          .from("chats")
          .update({ title: content.slice(0, 50) })
          .eq("id", chatId);
        
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, title: content.slice(0, 50) } : c
          )
        );
      }

      // Check if we're in branding mode
      if (isBrandingMode && !brandingComplete) {
        await handleBrandingResponse(chatId, content);
      } else {
        // Regular n8n chat flow
        await handleRegularChat(chatId, content, images);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar mensaje",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle branding questionnaire response
  const handleBrandingResponse = async (chatId: string, userResponse: string) => {
    try {
      // Save user's answer to branding data
      const currentQuestion = brandingQuestions[currentQuestionIndex];
      const newData = { ...brandingData };
      
      // Set nested properties
      let target: any = newData;
      for (let i = 0; i < currentQuestion.path.length - 1; i++) {
        const key = currentQuestion.path[i];
        if (!target[key]) target[key] = {};
        target = target[key];
      }
      
      const finalKey = currentQuestion.path[currentQuestion.path.length - 1];
      // No conversion needed - all answers are now text-based
      target[finalKey] = userResponse;
      
      setBrandingData(newData);

      // Check if we're done
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex >= brandingQuestions.length) {
        // Questionnaire complete!
        setBrandingComplete(true);
        setIsBrandingMode(false);
        
        const completionMessage = `**¡Cuestionario Completado!**

Has completado exitosamente el perfil de branding de tu marca. Aquí está tu resumen:

---

### **${newData.nombre_marca || 'Tu Marca'}**

**Oferta de Valor:**
${newData.oferta_valor || 'No especificada'}

**Cliente Ideal:**
${newData.perfil_cliente || 'No especificado'}

**Valores Fundamentales:**
${newData.valores_marca || 'No especificados'}

**Personalidad de Marca:**
${newData.personalidad_marca || 'No especificada'}

**Tono de Voz:**
${newData.tono_voz || 'No especificado'}

**Colores de Identidad:**
${newData.colores_identidad || 'No especificados'}

**Estilo Visual:**
${newData.estilo_visual || 'No especificado'}

**Objetivo Principal:**
${newData.objetivo_principal || 'No especificado'}

**Diferenciador Único:**
${newData.diferenciador || 'No especificado'}

---

**ID de Chat:** \`${chatId}\`

Puedes usar esta información para desarrollar tu identidad de marca, crear contenido y comunicarte consistentemente con tu audiencia.`;
        
        // Save completion message
        const { data: assistantMsg, error } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            user_id: user!.id,
            role: "assistant",
            content: completionMessage,
          })
          .select()
          .single();

        if (!error && assistantMsg) {
          setMessages((prev) => [
            ...prev,
            { id: assistantMsg.id, role: "assistant", content: completionMessage },
          ]);
        }

        toast({
          title: "¡Completado!",
          description: "Se ha recopilado toda la información de branding",
        });
      } else {
        // Ask next question
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = brandingQuestions[nextIndex];
        
        const questionMessage = `**Cuestionario de Branding** (Pregunta ${nextIndex + 1} de ${brandingQuestions.length})\n\n${nextQuestion.question}`;
        
        const { data: assistantMsg, error } = await supabase
          .from("messages")
          .insert({
            chat_id: chatId,
            user_id: user!.id,
            role: "assistant",
            content: questionMessage,
          })
          .select()
          .single();

        if (!error && assistantMsg) {
          setMessages((prev) => [
            ...prev,
            { id: assistantMsg.id, role: "assistant", content: questionMessage },
          ]);
        }
      }
    } catch (error) {
      console.error("Error in branding questionnaire:", error);
      throw error;
    }
  };

  // Handle regular chat (existing functionality)
  const handleRegularChat = async (chatId: string, content: string, images: File[]) => {
    try {
      // Use proxy in development to avoid CORS
      const n8nWebhookUrl = import.meta.env.DEV 
        ? "/api/chat" 
        : import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (!n8nWebhookUrl) {
        throw new Error("VITE_N8N_WEBHOOK_URL no está configurada en las variables de entorno");
      }

      // Prepare prompt - include context from previous messages if needed
      const prompt = content || (images.length > 0 ? "Describe esta imagen" : "");

      // Convert images to base64 for sending in HTTP request
      const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Prepare body with chat_id, prompt, and images if any
      const requestBody: {
        chat_id: string;
        prompt: string;
        images?: Array<{
          data: string; // base64 data URL
          name: string;
          type: string;
        }>;
      } = {
        chat_id: chatId,
        prompt: prompt,
      };

      // Convert and add images if any
      if (images.length > 0) {
        const imageData = await Promise.all(
          images.map(async (file) => ({
            data: await convertImageToBase64(file),
            name: file.name,
            type: file.type,
          }))
        );
        requestBody.images = imageData;
      }

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Error al conectar con n8n";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Stream response from n8n
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo obtener el stream de respuesta");
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Handle different streaming formats from n8n
        // Format 1: SSE (Server-Sent Events) with "data: " prefix
        // Format 2: Plain text streaming
        // Format 3: JSON lines

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.trim() === "") continue;

          // Handle SSE format
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(data);
              // Try different possible response formats
              const content = parsed.content || parsed.text || parsed.message || parsed.data || data;
              if (typeof content === "string") {
                assistantContent += content;
                setStreamingContent(assistantContent);
              }
            } catch {
              // If not JSON, treat as plain text
              assistantContent += data;
              setStreamingContent(assistantContent);
            }
          } 
          // Handle JSON lines format
          else if (line.startsWith("{") || line.startsWith("[")) {
            try {
              const parsed = JSON.parse(line);
              const content = parsed.content || parsed.text || parsed.message || parsed.data;
              if (typeof content === "string") {
                assistantContent += content;
                setStreamingContent(assistantContent);
              }
            } catch {
              // Invalid JSON, skip
            }
          }
          // Handle plain text streaming
          else {
            assistantContent += line;
            setStreamingContent(assistantContent);
          }
        }
      }

      // Handle any remaining content in buffer
      if (textBuffer.trim()) {
        assistantContent += textBuffer;
        setStreamingContent(assistantContent);
      }

      // Save assistant message
      const { data: assistantMsg, error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: user!.id,
          role: "assistant",
          content: assistantContent,
        })
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages((prev) => [
        ...prev,
        { id: assistantMsg.id, role: "assistant", content: assistantContent },
      ]);
      setStreamingContent("");

      // Update chat timestamp
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

    } catch (error) {
      console.error("Error in regular chat:", error);
      throw error;
    }
  };

  return (
    <>
      {isCreatingChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Creando chat...</p>
          </div>
        </div>
      )}

      <div className="h-screen flex bg-background">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={(id) => {
            setActiveChat(id);
            setSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            streamingContent={streamingContent}
            onStartBranding={messages.length === 0 && !brandingComplete ? () => {
              setIsBrandingMode(true);
              startBrandingQuestionnaire();
            } : undefined}
          />
          <ChatInput
            onSend={handleSend}
            disabled={false}
            isLoading={isLoading}
          />
        </main>
      </div>
    </>
  );
}
