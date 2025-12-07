import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { User, Bot, Download } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

export function MessageBubble({ role, content, images }: MessageBubbleProps) {
  const isUser = role === "user";

  const handleDownloadImage = async (url: string, index: number) => {
    try {
      let blob: Blob;
      let filename = `imagen-${index + 1}.png`;
      
      // Handle different URL types
      if (url.startsWith("data:image")) {
        // Base64 data URL
        const response = await fetch(url);
        blob = await response.blob();
        const mimeType = url.split(";")[0].split(":")[1];
        const extension = mimeType.split("/")[1] || "png";
        filename = `imagen-${index + 1}.${extension}`;
      } else if (url.startsWith("blob:")) {
        // Blob URL
        const response = await fetch(url);
        blob = await response.blob();
        const extension = blob.type.split("/")[1] || "png";
        filename = `imagen-${index + 1}.${extension}`;
      } else {
        // External URL
        const response = await fetch(url);
        blob = await response.blob();
        const contentType = response.headers.get("content-type");
        if (contentType) {
          const extension = contentType.split("/")[1] || "png";
          filename = `imagen-${index + 1}.${extension}`;
        }
      }
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar la imagen:", error);
      // Fallback: try to open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-accent"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-accent-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-user-message text-foreground rounded-tr-sm"
            : "bg-assistant-message text-foreground rounded-tl-sm"
        )}
      >
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Imagen ${idx + 1}`}
                  className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                />
                <button
                  onClick={() => handleDownloadImage(url, idx)}
                  className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100"
                  title="Descargar imagen"
                  aria-label="Descargar imagen"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-muted rounded-lg overflow-hidden my-2">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
