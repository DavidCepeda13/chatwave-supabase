# 🔧 Solución al Problema de CORS

## ✅ Cambios Implementados

He configurado un **proxy en Vite** para evitar problemas de CORS durante el desarrollo.

### Archivos Modificados:

1. **vite.config.ts** - Añadido proxy para redireccionar las peticiones
2. **Chat.tsx** - Actualizado para usar rutas locales en desarrollo

## 🚀 Cómo Usar

### 1. Reinicia el Servidor de Desarrollo

**IMPORTANTE:** Debes reiniciar el servidor para que el proxy tome efecto.

```bash
# Detén el servidor actual (Ctrl+C)
# Luego ejecuta:
npm run dev
```

O si usas bun:
```bash
bun run dev
```

### 2. Funcionamiento del Proxy

El proxy redirige automáticamente:

- **`/api/branding`** → `https://hackaton123.app.n8n.cloud/webhook/branding-chat`
- **`/api/chat`** → `https://hackaton123.app.n8n.cloud/webhook-test/chat`

En **desarrollo** (localhost): Las peticiones van a `/api/branding` y `/api/chat` (sin CORS)
En **producción**: Las peticiones van directamente a las URLs de n8n

### 3. Verificación

Después de reiniciar el servidor:
1. Abre la consola del navegador (F12)
2. Crea un nuevo chat
3. Deberías ver las peticiones a `/api/branding` en lugar de la URL completa de n8n
4. **NO** deberías ver errores de CORS

## 🔍 Cómo Funciona

### En Desarrollo (localhost):
```
Tu App → http://localhost:8080/api/branding → Vite Proxy → https://hackaton123.app.n8n.cloud/webhook/branding-chat
```

### En Producción:
```
Tu App → https://hackaton123.app.n8n.cloud/webhook/branding-chat (directo)
```

## 🛠️ Configuración del Proxy

El proxy está configurado en `vite.config.ts`:

```typescript
proxy: {
  '/api/branding': {
    target: 'https://hackaton123.app.n8n.cloud',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/branding/, '/webhook/branding-chat'),
    secure: false,
  },
  '/api/chat': {
    target: 'https://hackaton123.app.n8n.cloud',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/chat/, '/webhook-test/chat'),
    secure: false,
  }
}
```

## 📝 Código Actualizado

En `Chat.tsx`, ahora detectamos automáticamente el entorno:

```typescript
// Desarrollo: usa proxy local
// Producción: usa URL directa
const n8nWebhookUrl = import.meta.env.DEV 
  ? "/api/branding" 
  : import.meta.env.VITE_N8N_BRANDING_WEBHOOK_URL;
```

## ⚠️ Importante

- **Reinicia el servidor** después de cambios en `vite.config.ts`
- El proxy solo funciona en **desarrollo** (localhost)
- En producción, necesitarás configurar CORS en n8n o usar tu propio backend

## 🎯 Solución Permanente (Recomendado para Producción)

Para producción, configura CORS en tu webhook de n8n:

1. Ve a tu flujo en n8n
2. Abre el nodo "Respond to Webhook"
3. En "Options" → "Response Headers":
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   ```

O usa un nodo "Set" antes de responder:
```javascript
return [{
  json: $input.all(),
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}];
```
