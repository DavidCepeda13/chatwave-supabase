# 🔍 Guía de Depuración - Error 500 del Webhook

## ✅ Cambios Implementados

1. **Modo Manual**: El flujo de branding ya NO se inicia automáticamente
2. **Botón de Inicio**: Ahora hay un botón visible para iniciar el cuestionario cuando quieras
3. **Logs Detallados**: Se agregaron console.logs para ver exactamente qué está pasando
4. **Mejor Manejo de Errores**: Los errores muestran más información

## 🚀 Cómo Probar

1. Recarga la aplicación en el navegador
2. Crea un nuevo chat (o ve a uno vacío)
3. Verás un botón: **"Iniciar Cuestionario de Branding"** ✨
4. Abre la **Consola del Navegador** (F12 → Console)
5. Haz clic en el botón
6. Revisa los logs en la consola

## 🔍 Logs a Revisar

En la consola verás:
```
🚀 Starting branding conversation...
📍 URL: /api/branding
👤 User ID: user-xxxxx
📡 Response status: 500
❌ Error response: [mensaje de error del servidor]
```

## 🛠️ Problemas Comunes y Soluciones

### 1. Error 500 - Internal Server Error

**Causa**: El webhook de n8n tiene un problema en su lógica

**Soluciones**:

#### A) Verifica el Webhook en n8n:
1. Ve a tu flujo en n8n
2. Asegúrate de que el webhook esté **activado**
3. El path debe ser: `/webhook/branding-chat`

#### B) Verifica el Código del Function Node:

El nodo "Conversational Engine" debe:
- Inicializar correctamente el `store` global
- Manejar el caso cuando `message` está vacío (primera petición)
- Retornar JSON válido

**Código corregido para el Function Node:**

```javascript
const userId = $json.userId;
const userMessage = $json.message || ""; // Manejar mensaje vacío

const store = this.getWorkflowStaticData('global');

// Inicializar usuario si no existe
if (!store[userId]) {
  store[userId] = { currentStep: 0, data: {} };
}

const steps = [
  { key: "nombre_marca", question: "¿Cómo se llama tu marca?" },
  { key: "historia_marca", question: "Cuéntame la historia de tu marca." },
  { key: "oferta_valor", question: "¿Cuál es la oferta de valor de tu marca?" },
  { key: "valores_marca", question: "¿Cuáles son los valores principales de tu marca?" },
  { key: "perfil_cliente.edad", question: "¿Qué edad tiene tu cliente ideal?" },
  { key: "perfil_cliente.genero", question: "¿Cuál es el género de tu cliente ideal?" },
  { key: "perfil_cliente.ubicacion", question: "¿Dónde se encuentra tu cliente ideal?" },
  { key: "perfil_cliente.ingresos", question: "¿Qué nivel de ingresos tiene?" },
  { key: "perfil_cliente.profesion", question: "¿Cuál es su profesión?" },
  { key: "necesidades_cliente", question: "¿Cuáles son las principales necesidades de tu cliente ideal?" },
  { key: "caracter_marca", question: "¿Tu marca es más formal o informal? ¿Joven o seria? ¿Divertida, minimalista o sofisticada?" },
  { key: "adjetivos_marca", question: "Describe tu marca en 3 adjetivos." },
  { key: "marcas_inspiracion", question: "¿Qué marcas te inspiran?" },
  { key: "tono", question: "¿Qué tono prefieres? Profesional, cercano, inspirador, técnico o divertido." },
  { key: "estilos_evitar", question: "¿Qué estilos te gustaría evitar?" },
  { key: "colores_preferidos", question: "¿Qué colores prefieres para tu marca?" },
  { key: "colores_prohibidos", question: "¿Qué colores NO quieres usar?" },
  { key: "tipo_diseño", question: "¿Prefieres un diseño moderno o clásico?" },
  { key: "minimalista", question: "¿Quieres un estilo minimalista? (sí/no)" },
  { key: "detallado", question: "¿Quieres un diseño detallado? (sí/no)" },
  { key: "objetivo_marca", question: "¿Cuál es el objetivo principal? Ventas, posicionamiento, comunidad o educación." },
  { key: "elementos_obligatorios", question: "¿Qué elementos obligatorios debe incluir la marca?" },
  { key: "normas_respetar", question: "¿Qué normas se deben respetar?" },
  { key: "mensaje_al_mundo", question: "¿Qué mensaje le daría tu marca al mundo?" }
];

const session = store[userId];

// Guardar respuesta anterior (si existe)
if (session.currentStep > 0 && userMessage.trim() !== "") {
  const prev = steps[session.currentStep - 1];
  const parts = prev.key.split('.');

  let obj = session.data;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }

  obj[parts[parts.length - 1]] = userMessage;
}

// Verificar si ya terminamos
if (session.currentStep >= steps.length) {
  return [{
    json: {
      done: true,
      message: "✅ Información completa.",
      data: session.data
    }
  }];
}

// Obtener siguiente pregunta
const step = steps[session.currentStep];
session.currentStep++;

return [{
  json: {
    done: false,
    question: step.question,
    key: step.key
  }
}];
```

#### C) Verifica el Response Node:

El nodo "Respond to Webhook" debe:
- Estar conectado correctamente
- Response Mode: "Using 'Respond to Webhook' Node"
- No tener filtros que bloqueen la respuesta

### 2. Error de CORS

Si ves errores de CORS:
- Asegúrate de haber **reiniciado el servidor** después de los cambios en `vite.config.ts`
- El proxy solo funciona con el servidor de desarrollo corriendo

### 3. Webhook No Responde

Si el webhook no responde en absoluto:
- Verifica que el flujo esté **activado** en n8n
- Prueba el webhook directamente con Postman o cURL:

```bash
curl -X POST https://hackaton123.app.n8n.cloud/webhook/branding-chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "message": ""}'
```

Deberías recibir:
```json
{
  "done": false,
  "question": "¿Cómo se llama tu marca?",
  "key": "nombre_marca"
}
```

## 📊 Testear el Webhook Paso a Paso

### 1. Primera petición (iniciar):
```bash
curl -X POST http://localhost:8080/api/branding \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-123", "message": ""}'
```

Respuesta esperada:
```json
{
  "done": false,
  "question": "¿Cómo se llama tu marca?",
  "key": "nombre_marca"
}
```

### 2. Segunda petición (responder):
```bash
curl -X POST http://localhost:8080/api/branding \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-123", "message": "Mi Marca Cool"}'
```

Respuesta esperada:
```json
{
  "done": false,
  "question": "Cuéntame la historia de tu marca.",
  "key": "historia_marca"
}
```

## 🎯 Checklist de Verificación

- [ ] Flujo de n8n está activado
- [ ] Webhook path es `/webhook/branding-chat`
- [ ] Function Node maneja mensajes vacíos
- [ ] Response Node está conectado
- [ ] Servidor de desarrollo reiniciado
- [ ] Consola del navegador abierta para ver logs
- [ ] Botón de branding visible en la UI

## 💡 Tip: Activar en Producción

Una vez que funcione correctamente, puedes volver a activar el modo automático:

En `Chat.tsx`, descomenta estas líneas (busca "DISABLED"):

```typescript
useEffect(() => {
  const initBrandingConversation = async () => {
    if (activeChat && messages.length === 0 && !isLoading && !brandingComplete) {
      setIsBrandingMode(true);
      await startBrandingConversation();
    }
  };

  initBrandingConversation();
}, [activeChat, messages.length]);
```
