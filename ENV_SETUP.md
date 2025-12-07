# Configuración de Variables de Entorno

Este proyecto requiere las siguientes variables de entorno para funcionar correctamente.

## Variables Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# n8n Webhook URL
# URL del webhook de n8n que procesa los mensajes del chat
# Debe ser un endpoint POST que acepte { chat_id, prompt } y devuelva un stream
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Logo Generator Webhook URL
# URL del webhook que genera el logo basado en los datos de branding
# Debe ser un endpoint POST que acepte los datos de branding y devuelva una imagen
VITE_LOGO_GENERATOR_WEBHOOK_URL=https://your-logo-generator.com/webhook/generate-logo

# Final n8n Webhook URL
# URL del webhook que se usa después de generar el logo
# Funciona como chat normal pero puede devolver texto + imágenes
VITE_N8N_WEBHOOK_URL_FINAL=https://your-n8n-instance.com/webhook/final-chat

# Image Webhook URL
# URL del webhook que procesa imágenes adjuntas en el chat
# Se llama cuando el usuario adjunta una imagen con o sin descripción
VITE_N8N_WEBHOOK_URL_IMAGEN=https://your-n8n-instance.com/webhook/process-image

# Description Webhook URL
# URL del webhook que genera descripciones de productos basadas en imágenes
# Se llama en paralelo con VITE_N8N_WEBHOOK_URL_IMAGEN cuando se adjunta una imagen
VITE_N8N_WEBHOOK_URL_DESCRIPTION=https://your-n8n-instance.com/webhook/generate-description

# MercadoLibre Image Webhook URL
# URL del webhook que genera la imagen principal para MercadoLibre
# Por defecto: https://sellify.app.n8n.cloud/webhook/upload-ticket
VITE_MERCADOLIBRE_IMAGE_WEBHOOK_URL=https://sellify.app.n8n.cloud/webhook/upload-ticket
```

## Descripción de Variables

### VITE_SUPABASE_URL
URL de tu proyecto de Supabase. Puedes encontrarla en el dashboard de Supabase.

### VITE_SUPABASE_PUBLISHABLE_KEY
Clave pública (anon key) de tu proyecto de Supabase. Puedes encontrarla en el dashboard de Supabase.

### VITE_N8N_WEBHOOK_URL
URL del webhook de n8n que procesará los mensajes del chat. 

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "chat_id": "uuid-del-chat",
    "prompt": "mensaje del usuario",
    "images": [  // Opcional: array de imágenes en base64 si se adjuntaron
      {
        "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        "name": "imagen.jpg",
        "type": "image/jpeg"
      }
    ]
  }
  ```
- **Respuesta:** Debe devolver un stream (Server-Sent Events, texto plano, o JSON lines)

**Nota:** 
- El campo `images` solo se incluye cuando el usuario adjunta imágenes al mensaje
- Las imágenes se envían como base64 en el formato data URL (data:image/type;base64,...)
- Cada imagen incluye: `data` (base64), `name` (nombre del archivo), y `type` (MIME type)

**Ejemplo de URL:**
```
https://tu-n8n.com/webhook/abc123def456
```

### VITE_LOGO_GENERATOR_WEBHOOK_URL
URL del webhook que genera el logo basado en los datos de branding recopilados del cuestionario.

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "chat_id": "uuid-del-chat",
    "nombre_marca": "Nombre de la marca",
    "oferta_valor": "Oferta de valor",
    "perfil_cliente": "Perfil del cliente",
    "valores_marca": "Valores de la marca",
    "personalidad_marca": "Personalidad de la marca",
    "tono_voz": "Tono de voz",
    "colores_identidad": "Colores de identidad",
    "estilo_visual": "Estilo visual",
    "objetivo_principal": "Objetivo principal",
    "diferenciador": "Diferenciador"
  }
  ```
- **Respuesta:** Debe devolver una imagen. Puede ser:
  - Una imagen directa (Content-Type: image/png, image/jpeg, etc.)
  - Un JSON con la imagen en uno de estos formatos:
    ```json
    {
      "image_url": "https://...",
      "image": "data:image/png;base64,...",
      "logo_url": "https://...",
      "url": "https://...",
      "data": "data:image/png;base64,..."
    }
    ```

**Nota:** 
- El webhook se llama automáticamente cuando se completa el cuestionario de branding
- La generación del logo puede tardar varios segundos, se muestra un indicador de carga durante el proceso
- El logo generado se muestra automáticamente en el chat

**Ejemplo de URL:**
```
https://tu-logo-generator.com/webhook/generate-logo
```

### VITE_N8N_WEBHOOK_URL_FINAL
URL del webhook de n8n que se usa después de que se genera el logo. Funciona como chat normal pero con capacidades extendidas para manejar imágenes.

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "chat_id": "uuid-del-chat",
    "prompt": "mensaje del usuario",
    "images": [  // Opcional: array de imágenes en base64 si se adjuntaron
      {
        "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        "name": "imagen.jpg",
        "type": "image/jpeg"
      }
    ]
  }
  ```
- **Respuesta:** Debe devolver un JSON con el siguiente formato:
  ```json
  {
    "text": "Texto de respuesta (opcional)",
    "content": "Texto de respuesta (alternativo a text)",
    "message": "Texto de respuesta (alternativo a text)",
    "images": [  // Opcional: array de imágenes (0, 1 o múltiples)
      "https://url-de-imagen.com/imagen1.png",
      "data:image/png;base64,..."
    ],
    "image": "URL o base64 de una sola imagen (alternativo a images)",
    "image_url": "URL de imagen (alternativo)",
    "logo_url": "URL de imagen (alternativo)",
    "url": "URL de imagen (alternativo)"
  }
  ```

**Nota:** 
- Este webhook se activa automáticamente después de que se genera el logo
- Las imágenes del usuario siempre se envían en base64 en el campo `images`
- La respuesta puede contener:
  - Solo texto (sin campo `images` o con `images: []`)
  - Texto + 0 imágenes
  - Texto + 1 imagen (en `image`, `image_url`, `logo_url`, `url` o `images[0]`)
  - Texto + múltiples imágenes (en el array `images`)
- Si la respuesta no es JSON, se trata como texto plano
- El webhook se usa solo después de generar el logo; antes se usa `VITE_N8N_WEBHOOK_URL`

**Ejemplo de URL:**
```
https://tu-n8n.com/webhook/final-chat
```

### VITE_N8N_WEBHOOK_URL_IMAGEN
URL del webhook que procesa imágenes adjuntas en el chat. Se llama automáticamente cuando el usuario adjunta una imagen (con o sin descripción).

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "Description": "Descripción del usuario (puede estar vacía)",
    "FileBase64": "base64_string_sin_prefijo_data_url"
  }
  ```
- **Respuesta:** Debe devolver una imagen y texto. Puede ser:
  - Una imagen directa (Content-Type: image/png, image/jpeg, etc.) - el texto será un mensaje por defecto
  - Un JSON con texto e imagen:
    ```json
    {
      "text": "Texto de respuesta",
      "content": "Texto de respuesta (alternativo)",
      "message": "Texto de respuesta (alternativo)",
      "image_url": "https://...",
      "image": "data:image/png;base64,... o URL",
      "url": "https://...",
      "data": "data:image/png;base64,..."
    }
    ```
  - Texto plano - solo se mostrará el texto

**Nota:** 
- El webhook se llama automáticamente cuando el usuario adjunta una imagen en el chat
- La imagen se envía en base64 sin el prefijo `data:image/type;base64,`
- La descripción es el texto que el usuario escribe junto con la imagen (puede estar vacía)
- La imagen de respuesta se guarda automáticamente en Supabase Storage si es un blob o base64
- Si la respuesta es una URL externa, se guarda como referencia

**Ejemplo de URL:**
```
https://tu-n8n.com/webhook/process-image
```

### VITE_N8N_WEBHOOK_URL_DESCRIPTION
URL del webhook que genera descripciones de productos basadas en imágenes. Se llama en paralelo con `VITE_N8N_WEBHOOK_URL_IMAGEN` cuando el usuario adjunta una imagen.

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "Description": "Descripción del usuario (puede estar vacía)",
    "FileBase64": "base64_string_sin_prefijo_data_url"
  }
  ```
- **Respuesta:** Debe devolver un JSON con la siguiente estructura:
  ```json
  [
    {
      "output": {
        "title": "Título del producto",
        "description": "Descripción detallada del producto"
      }
    }
  ]
  ```
  O alternativamente:
  ```json
  {
    "output": {
      "title": "Título del producto",
      "description": "Descripción detallada del producto"
    }
  }
  ```

**Nota:** 
- El webhook se llama automáticamente en paralelo con `VITE_N8N_WEBHOOK_URL_IMAGEN` cuando el usuario adjunta una imagen
- La imagen se envía en base64 sin el prefijo `data:image/type;base64,`
- La descripción es el texto que el usuario escribe junto con la imagen (puede estar vacía)
- **Importante:** Aunque este webhook puede responder más rápido, la imagen se muestra primero y luego el texto de la descripción
- El texto se formatea como: **Título** (en negrita) seguido de la descripción

**Ejemplo de URL:**
```
https://tu-n8n.com/webhook/generate-description
```

### VITE_MERCADOLIBRE_IMAGE_WEBHOOK_URL
URL del webhook que genera la imagen principal para MercadoLibre. Por defecto usa `https://sellify.app.n8n.cloud/webhook/upload-ticket`.

**Formato esperado del webhook:**
- **Método:** POST
- **Body:** 
  ```json
  {
    "Description": "Descripción del producto",
    "FileBase64": "base64_string_sin_prefijo_data_url"
  }
  ```
- **Respuesta:** Debe devolver una imagen. Puede ser:
  - Una imagen directa (Content-Type: image/png, image/jpeg, etc.)
  - Un JSON con la imagen en uno de estos formatos:
    ```json
    {
      "image_url": "https://...",
      "image": "data:image/png;base64,...",
      "url": "https://...",
      "data": "data:image/png;base64,..."
    }
    ```

**Nota:** 
- El webhook se llama automáticamente cuando el usuario tiene el logo generado, sube una imagen y escribe una descripción
- La imagen se envía en base64 sin el prefijo `data:image/type;base64,`
- La descripción es el texto que el usuario escribe junto con la imagen
- La imagen generada se guarda automáticamente en Supabase Storage

**Ejemplo de URL:**
```
https://sellify.app.n8n.cloud/webhook/upload-ticket
```

## Notas

- Todas las variables deben comenzar con `VITE_` para que Vite las exponga al frontend
- El archivo `.env` está en `.gitignore` y no se subirá al repositorio
- Después de crear o modificar el archivo `.env`, reinicia el servidor de desarrollo

