# 🎨 Integración de Flujo de Branding Conversacional

## Descripción General

El chat ahora incluye un flujo conversacional automático que recopila información de branding a través de preguntas secuenciales cuando un usuario entra a un nuevo chat.

## 🔄 Cómo Funciona

### 1. **Inicio Automático**
Cuando un usuario crea un nuevo chat y entra en él:
- Se activa automáticamente el modo de branding (`isBrandingMode = true`)
- Se envía una petición inicial al webhook de n8n sin mensaje
- n8n responde con la primera pregunta del flujo

### 2. **Flujo de Preguntas**
El sistema hace 24 preguntas en orden:

1. Nombre de la marca
2. Historia de la marca
3. Oferta de valor
4. Valores de la marca
5. Edad del cliente ideal
6. Género del cliente ideal
7. Ubicación del cliente ideal
8. Nivel de ingresos
9. Profesión del cliente
10. Necesidades del cliente
11. Carácter de la marca (formal/informal, joven/seria, etc.)
12. 3 adjetivos que describen la marca
13. Marcas que inspiran
14. Tono preferido (profesional, cercano, inspirador, técnico, divertido)
15. Estilos a evitar
16. Colores preferidos
17. Colores prohibidos
18. Tipo de diseño (moderno/clásico)
19. ¿Estilo minimalista? (sí/no)
20. ¿Diseño detallado? (sí/no)
21. Objetivo principal (ventas, posicionamiento, comunidad, educación)
22. Elementos obligatorios
23. Normas a respetar
24. Mensaje al mundo

### 3. **Comunicación con n8n**

Cada vez que el usuario responde:
```json
{
  "userId": "user-{supabase_user_id}",
  "message": "respuesta del usuario"
}
```

n8n responde con:
- **Durante el flujo:**
```json
{
  "done": false,
  "question": "¿Siguiente pregunta?",
  "key": "nombre_del_campo"
}
```

- **Al completar:**
```json
{
  "done": true,
  "message": "✅ Información completa.",
  "data": {
    "nombre_marca": "...",
    "historia_marca": "...",
    // ... todo el perfil de branding
  }
}
```

### 4. **Finalización**
Cuando se completan todas las preguntas:
- Se muestra un mensaje de confirmación
- Se guarda el JSON completo con toda la información de branding
- Se muestra el perfil completo en formato JSON en el chat
- El modo de branding se desactiva para ese chat

## 📊 Formato del JSON Final

```json
{
  "nombre_marca": "string",
  "historia_marca": "string",
  "oferta_valor": "string",
  "valores_marca": "string",
  "perfil_cliente": {
    "edad": "string",
    "genero": "string",
    "ubicacion": "string",
    "ingresos": "string",
    "profesion": "string"
  },
  "necesidades_cliente": "string",
  "caracter_marca": "formal/informal | joven/seria | divertida/minimalista/sofisticada",
  "adjetivos_marca": "string",
  "marcas_inspiracion": "string",
  "tono": "profesional | cercano | inspirador | tecnico | divertido",
  "estilos_evitar": "string",
  "colores_preferidos": "string",
  "colores_prohibidos": "string",
  "tipo_diseño": "moderno | clasico",
  "minimalista": boolean,
  "detallado": boolean,
  "objetivo_marca": "ventas | posicionamiento | comunidad | educación",
  "elementos_obligatorios": "string",
  "normas_respetar": "string",
  "mensaje_al_mundo": "string"
}
```

## 🔧 Variables de Entorno

Se ha añadido una nueva variable de entorno:

```env
VITE_N8N_BRANDING_WEBHOOK_URL=https://hackaton123.app.n8n.cloud/webhook/branding-chat
```

## 🎯 Características Implementadas

### Estado de la Aplicación
- `isBrandingMode`: Boolean que indica si estamos en el flujo de branding
- `brandingData`: Objeto que almacena la información recopilada
- `brandingComplete`: Boolean que indica si el flujo ha terminado
- `userId`: ID único del usuario para el tracking en n8n

### Funciones Principales

#### `startBrandingConversation()`
- Se ejecuta automáticamente al entrar a un nuevo chat
- Envía la primera petición a n8n
- Muestra la primera pregunta

#### `handleBrandingResponse(chatId, userResponse)`
- Procesa cada respuesta del usuario
- Envía la respuesta a n8n
- Recibe la siguiente pregunta o el resultado final
- Guarda todos los mensajes en Supabase

#### `handleRegularChat(chatId, content, images)`
- Mantiene la funcionalidad original del chat
- Se activa cuando el modo de branding está desactivado

## 🚀 Flujo de Uso

1. Usuario se autentica
2. Usuario crea un nuevo chat
3. **AUTOMÁTICAMENTE** el sistema inicia el flujo de branding
4. El asistente hace la primera pregunta
5. Usuario responde
6. El sistema muestra la siguiente pregunta
7. ... (repite 24 veces)
8. Al completar, se muestra el JSON completo con toda la información
9. El chat vuelve a modo normal para conversaciones regulares

## 📝 Notas Técnicas

- Todos los mensajes (preguntas y respuestas) se guardan en Supabase
- El estado de la conversación se mantiene en n8n usando `userId`
- El flujo es completamente automático y no requiere intervención manual
- Si hay algún error, el sistema muestra un toast con el mensaje de error
- El modo de branding solo se activa en chats nuevos sin mensajes previos

## 🔄 Transición a Chat Normal

Una vez completado el flujo de branding:
- `brandingComplete` se marca como `true`
- `isBrandingMode` permanece activo pero ya no procesa respuestas de branding
- El chat puede continuar con conversaciones normales
- Los datos de branding quedan guardados y disponibles en el estado

## 🛠️ Webhook de n8n

El flujo en n8n debe:
1. Mantener el estado de la conversación por `userId`
2. Rastrear qué pregunta sigue
3. Almacenar las respuestas en el formato correcto
4. Retornar `done: true` cuando se complete el cuestionario
5. Incluir todo el objeto `data` con la información completa al finalizar
