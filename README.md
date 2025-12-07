# ChatWave - Plataforma de Branding con IA

Plataforma conversacional impulsada por IA que ayuda a emprendedores y empresas a crear su identidad de marca mediante un cuestionario interactivo, generación automática de logos y procesamiento inteligente de imágenes para productos.

## Problema

Los emprendedores y pequeñas empresas enfrentan múltiples desafíos al crear su identidad de marca:

- **Falta de claridad en el branding**: No saben cómo definir su identidad visual, valores y personalidad de marca de manera estructurada
- **Procesos costosos y lentos**: Contratar diseñadores y consultores de branding es costoso y requiere mucho tiempo
- **Falta de herramientas integradas**: No existe una solución que combine cuestionarios de branding, generación de logos y procesamiento de productos en un solo lugar
- **Dificultad para escalar**: Una vez definida la marca, generar contenido visual consistente (logos, imágenes de productos) requiere múltiples herramientas y procesos manuales
- **Barrera técnica**: Las herramientas existentes requieren conocimientos técnicos o de diseño que muchos emprendedores no poseen

## Solución

ChatWave ofrece una solución integral y conversacional que:

- **Cuestionario interactivo de branding**: Guía a los usuarios a través de 4 preguntas estructuradas que recopilan toda la información necesaria para definir su marca (valores, personalidad, colores, estilo visual, etc.)
- **Generación automática de logos**: Una vez completado el cuestionario, genera automáticamente un logo personalizado basado en las respuestas del usuario
- **Procesamiento inteligente de imágenes**: Permite a los usuarios subir imágenes de productos y genera automáticamente descripciones optimizadas y imágenes mejoradas para plataformas como MercadoLibre
- **Interfaz conversacional intuitiva**: Todo se realiza a través de un chat natural, eliminando la barrera técnica y haciendo el proceso accesible para cualquier usuario
- **Almacenamiento persistente**: Todos los datos, mensajes e imágenes se guardan en Supabase, permitiendo continuar el trabajo en cualquier momento

## Arquitectura

### Frontend
- **React + TypeScript**: Interfaz de usuario moderna y type-safe
- **Vite**: Build tool rápido y eficiente
- **shadcn-ui + Tailwind CSS**: Componentes UI modernos y responsive
- **React Router**: Navegación entre páginas
- **React Query**: Gestión de estado del servidor y caché

### Backend y Servicios
- **Supabase**: 
  - Autenticación de usuarios
  - Base de datos PostgreSQL para chats, mensajes y datos de branding
  - Storage para imágenes y logos generados
- **n8n (Workflow Automation)**:
  - Procesamiento de mensajes del chat con IA
  - Gestión del flujo conversacional de branding
  - Procesamiento de imágenes y generación de descripciones
  - Integración con servicios de generación de imágenes

### Flujo de Datos

```
Usuario → Frontend (React) → Supabase (Auth/DB) → n8n Webhooks → IA Services
                ↓                                           ↓
         Almacenamiento local                    Respuestas procesadas
                ↓                                           ↓
         UI actualizada ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Componentes Principales

1. **Sistema de Autenticación**: Integrado con Supabase Auth
2. **Chat Conversacional**: Maneja mensajes de texto e imágenes con streaming de respuestas
3. **Flujo de Branding**: Cuestionario automático de 4 preguntas con seguimiento de estado
4. **Generador de Logos**: Integración con webhook que genera logos basados en datos de branding
5. **Procesador de Imágenes**: Múltiples webhooks para diferentes tipos de procesamiento:
   - Procesamiento general de imágenes
   - Generación de descripciones de productos
   - Generación de imágenes para MercadoLibre

## Uso de IA

ChatWave utiliza inteligencia artificial en múltiples puntos del flujo:

### 1. **Procesamiento Conversacional**
- **Modelo**: Integrado a través de n8n (puede usar GPT, Claude, Gemini u otros modelos)
- **Uso**: Procesa los mensajes del chat, mantiene el contexto de la conversación y genera respuestas naturales
- **Características**: Streaming de respuestas en tiempo real para mejor UX

### 2. **Flujo de Branding Inteligente**
- **Modelo**: IA conversacional especializada en branding
- **Uso**: 
  - Guía al usuario a través de 4 preguntas estructuradas
  - Mantiene el estado de la conversación
  - Valida y estructura las respuestas en formato JSON
  - Genera un perfil completo de branding al finalizar

### 3. **Generación de Logos**
- **Modelo**: Generador de imágenes (DALL-E, Midjourney, Stable Diffusion, Nano Banana etc.)
- **Uso**: Crea logos personalizados basados en:
  - Nombre de la marca
  - Colores de identidad
  - Estilo visual preferido
  - Valores y personalidad de la marca
- **Integración**: Webhook dedicado que recibe datos estructurados y devuelve imágenes

### 4. **Análisis y Descripción de Productos**
- **Modelo**: Vision AI (GPT-4 Vision, Claude Vision, Gemini, etc.)
- **Uso**: 
  - Analiza imágenes de productos subidas por el usuario
  - Genera descripciones optimizadas para e-commerce
  - Extrae características y beneficios del producto
  - Crea títulos y descripciones estructuradas

### 5. **Generación de Imágenes para E-commerce**
- **Modelo**: Generador de imágenes especializado
- **Uso**: Crea imágenes mejoradas de productos para plataformas como MercadoLibre
- **Características**: Optimiza imágenes según las mejores prácticas de e-commerce

### Ventajas del Enfoque
- **Modularidad**: Cada funcionalidad de IA está separada en webhooks independientes
- **Flexibilidad**: Fácil cambiar o actualizar modelos sin afectar otras partes
- **Escalabilidad**: n8n permite manejar múltiples solicitudes concurrentes
- **Costo-efectividad**: Solo se procesa lo necesario, cuando es necesario (on demand)

## Impacto

### Para Emprendedores
- **Ahorro de tiempo**: Reduce de semanas a minutos el proceso de definición de marca
- **Reducción de costos**: Elimina la necesidad de contratar diseñadores y consultores en etapas tempranas
- **Democratización**: Hace el branding profesional accesible a cualquier persona, sin conocimientos técnicos
- **Rapidez en el lanzamiento**: Permite lanzar productos más rápido con identidad visual definida

### Para el Ecosistema
- **Automatización de procesos manuales**: Reduce el trabajo repetitivo en la creación de contenido visual
- **Estandarización de calidad**: Proporciona un nivel consistente de branding profesional
- **Integración con plataformas**: Facilita la publicación en marketplaces como MercadoLibre

### Métricas de Impacto Potencial
- **Tiempo de onboarding**: De días/semanas a minutos
- **Costo de branding inicial**: Reducción del 80-90% comparado con servicios tradicionales
- **Tasa de completación**: Interfaz conversacional aumenta la participación del usuario
- **Escalabilidad**: Puede atender múltiples usuarios simultáneamente sin degradación

## Instrucciones de Ejecución

### Requisitos Previos

- **Node.js** (v18 o superior) - [Instalar con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** o **bun** (incluido con Node.js)
- Cuenta de **Supabase** con proyecto creado
- Instancia de **n8n** configurada con los webhooks necesarios

### Pasos para Ejecutar

1. **Clonar el repositorio**
```sh
git clone <YOUR_GIT_URL>
cd chatwave-supabase
```

2. **Instalar dependencias**
```sh
npm install
# o si usas bun:
bun install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto. Puedes usar `ENV_SETUP.md` como referencia:

```sh
# Copiar el archivo de ejemplo (editar después con tus valores)
cp ENV_SETUP.md .env
```

Edita el archivo `.env` con tus valores reales. Ver [ENV_SETUP.md](./ENV_SETUP.md) para instrucciones detalladas.

**Variables requeridas:**
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_anon_de_supabase
VITE_N8N_WEBHOOK_URL=url_webhook_n8n_chat_inicial
VITE_LOGO_GENERATOR_WEBHOOK_URL=url_webhook_generador_logos
VITE_N8N_WEBHOOK_URL_FINAL=url_webhook_n8n_chat_final
VITE_N8N_WEBHOOK_URL_IMAGEN=url_webhook_procesamiento_imagenes
VITE_N8N_WEBHOOK_URL_DESCRIPTION=url_webhook_descripciones
VITE_MERCADOLIBRE_IMAGE_WEBHOOK_URL=url_webhook_mercadolibre
```

4. **Iniciar el servidor de desarrollo**
```sh
npm run dev
# o con bun:
bun run dev
```

5. **Abrir en el navegador**

El servidor se iniciará en `http://localhost:8080` (o el puerto que Vite asigne).

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con hot-reload
- `npm run build` - Construye la aplicación para producción
- `npm run build:dev` - Construye en modo desarrollo
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter para verificar el código

### Configuración Adicional

Para más detalles sobre la configuración de variables de entorno y webhooks, consulta:
- [ENV_SETUP.md](./ENV_SETUP.md) - Configuración detallada de variables
- [BRANDING_FLOW.md](./BRANDING_FLOW.md) - Flujo de branding conversacional
- [DEBUG_WEBHOOK.md](./DEBUG_WEBHOOK.md) - Depuración de webhooks

## Tecnologías Utilizadas

- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca UI
- **shadcn-ui** - Componentes UI accesibles
- **Tailwind CSS** - Framework CSS utility-first
- **Supabase** - Backend as a Service (Database, Auth, Storage)
- **n8n** - Automatización de workflows e integración con IA
- **React Router** - Enrutamiento
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Despliegue

### Opción 1: Lovable (Recomendado)

Si este proyecto fue creado con Lovable:
1. Abre [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)
2. Haz clic en **Share → Publish**
3. Sigue las instrucciones para configurar el dominio

### Opción 2: Despliegue Manual

1. **Construir la aplicación:**
```sh
npm run build
```

2. **Desplegar la carpeta `dist/`** en tu servicio de hosting preferido:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - AWS S3 + CloudFront
   - Cualquier servicio de hosting estático

3. **Configurar variables de entorno** en tu plataforma de hosting

### Dominio Personalizado

Para conectar un dominio personalizado en Lovable:
1. Navega a **Project > Settings > Domains**
2. Haz clic en **Connect Domain**
3. Sigue las instrucciones

Más información: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
