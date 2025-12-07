# 🎨 Cuestionario de Branding Integrado

## 📋 Descripción

La aplicación ahora incluye un **cuestionario de branding** completamente integrado que recopila información detallada de tu marca a través de 24 preguntas.

## ✨ Características

- ✅ **Sin dependencias externas**: Todo funciona directamente en la aplicación
- ✅ **24 preguntas estructuradas**: Cubre todos los aspectos del branding
- ✅ **Progreso visible**: Muestra "Pregunta X de 24"
- ✅ **Datos estructurados**: Guarda las respuestas en formato JSON
- ✅ **Integrado con Supabase**: Todas las preguntas y respuestas se guardan

## 🚀 Cómo Usar

1. **Crea un nuevo chat** o ve a un chat vacío
2. Verás un botón: **"Iniciar Cuestionario de Branding"** ✨
3. Haz clic en el botón
4. Responde las 24 preguntas una por una
5. Al finalizar, verás un resumen completo en formato JSON

## 📝 Preguntas del Cuestionario

El cuestionario incluye:

### Información Básica (4 preguntas)
- Nombre de la marca
- Historia de la marca
- Oferta de valor
- Valores principales

### Perfil del Cliente (5 preguntas)
- Edad del cliente ideal
- Género
- Ubicación
- Nivel de ingresos
- Profesión

### Necesidades del Cliente (1 pregunta)
- Principales necesidades

### Personalidad de la Marca (3 preguntas)
- Carácter (formal/informal, joven/seria, etc.)
- 3 adjetivos descriptivos
- Marcas inspiradoras

### Comunicación (2 preguntas)
- Tono preferido
- Estilos a evitar

### Diseño Visual (5 preguntas)
- Colores preferidos
- Colores prohibidos
- Tipo de diseño (moderno/clásico)
- Estilo minimalista (sí/no)
- Diseño detallado (sí/no)

### Estrategia (3 preguntas)
- Objetivo principal
- Elementos obligatorios
- Normas a respetar

### Mensaje (1 pregunta)
- Mensaje al mundo

## 📊 Formato del JSON Final

Al completar el cuestionario, obtendrás:

```json
{
  "nombre_marca": "...",
  "historia_marca": "...",
  "oferta_valor": "...",
  "valores_marca": "...",
  "perfil_cliente": {
    "edad": "...",
    "genero": "...",
    "ubicacion": "...",
    "ingresos": "...",
    "profesion": "..."
  },
  "necesidades_cliente": "...",
  "caracter_marca": "...",
  "adjetivos_marca": "...",
  "marcas_inspiracion": "...",
  "tono": "...",
  "estilos_evitar": "...",
  "colores_preferidos": "...",
  "colores_prohibidos": "...",
  "tipo_diseño": "...",
  "minimalista": true/false,
  "detallado": true/false,
  "objetivo_marca": "...",
  "elementos_obligatorios": "...",
  "normas_respetar": "...",
  "mensaje_al_mundo": "..."
}
```

## 💾 Almacenamiento

- Todas las preguntas y respuestas se guardan en Supabase
- El JSON completo queda disponible en el estado de React
- Puedes copiar el JSON final del chat cuando termine

## 🎯 Características Técnicas

- **Estado local**: Maneja el cuestionario con React state
- **Sin APIs externas**: No depende de n8n ni servicios externos
- **Validación de respuestas**: Convierte automáticamente "sí/no" a boolean
- **Paths anidados**: Organiza los datos en estructura jerárquica
- **Progress tracking**: Sabe en qué pregunta estás

## 🔄 Después del Cuestionario

Una vez completado:
- El modo de branding se desactiva
- Puedes continuar con conversaciones normales en el mismo chat
- Los datos de branding quedan guardados
- El JSON completo se muestra en el último mensaje
