# Code Splitting Strategy - Nespresso Assistant

## 📚 Resumen

Esta aplicación utiliza **code splitting** para optimizar el rendimiento mediante carga diferida (lazy loading) de componentes no críticos.

## 🎯 Estrategia Implementada

### Componentes Core (Carga Inmediata)

Estos componentes se cargan inmediatamente porque son esenciales para la primera renderización:

- `ChatMessage` - Mensajes del chat
- `InputBar` - Barra de entrada de texto
- `LoadingSpinner` - Indicador de carga
- `LoadingFallback` - Fallback para Suspense
- Iconos básicos (CoffeeIcon, SparklesIcon, BookmarkIcon, CameraIcon)

### Componentes Lazy (Carga Bajo Demanda)

Estos componentes se cargan solo cuando son necesarios:

- `VideoGeneratorModal` - Modal de generación de video
- `SavedRepairsModal` - Modal de reparaciones guardadas
- `CameraIdentificationModal` - Modal de identificación por cámara
- `DatabaseDashboard` - Dashboard de base de datos
- `KnowledgeBase` - Base de conocimientos
- `Checklist` - Checklist de reparación

## 🚀 Utility: lazyWithPreload

Hemos creado una utility personalizada `lazyWithPreload` que extiende `React.lazy()` con capacidad de precarga:

```typescript
import { lazyWithPreload } from './utils/lazyPreload';

const MyComponent = lazyWithPreload(() => import('./components/MyComponent'));

// Precargar antes de mostrar
MyComponent.preload();

// Usar normalmente
<Suspense fallback={<Loading />}>
  <MyComponent />
</Suspense>
```

### Beneficios de lazyWithPreload

1. **Carga diferida**: El componente solo se descarga cuando se necesita
2. **Precarga estratégica**: Podemos precargar antes de que el usuario haga clic
3. **Mejor UX**: Modales se abren instantáneamente después de hover

## ⚡ Optimizaciones Implementadas

### 1. Preload en Hover

Los modales se precargan cuando el usuario pasa el mouse sobre sus botones:

```typescript
<button
  onClick={() => setShowModal(true)}
  onMouseEnter={() => MyModal.preload()}
>
  Abrir Modal
</button>
```

**Resultado**: El modal abre ~200-500ms más rápido porque ya está precargado.

### 2. Manual Chunks en Vite

Configuración optimizada en `vite.config.ts`:

```typescript
manualChunks: {
  // Vendor chunks
  'react-vendor': ['react', 'react-dom'],
  'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
  
  // Large components
  'modals': [
    './components/VideoGeneratorModal',
    './components/SavedRepairsModal',
    './components/DatabaseDashboard',
    './components/CameraIdentificationModal',
  ],
}
```

**Beneficios**:
- Mejor caching del navegador
- Chunks más pequeños y específicos
- Actualizaciones más eficientes

### 3. Bundle Analysis

Herramientas para analizar el tamaño de bundles:

```bash
# Build con análisis
npm run build:analyze

# Ver estadísticas
npm run analyze
```

## 📊 Resultados Esperados

### Antes de Code Splitting
- Bundle principal: ~800KB
- Tiempo de carga inicial: ~2-3s
- Modales: Carga instantánea (ya incluidos)

### Después de Code Splitting
- Bundle principal: ~300-400KB (60-70% reducción)
- Tiempo de carga inicial: ~1-1.5s (50% más rápido)
- Modales: 
  - Sin hover: ~200-300ms
  - Con hover: Instantáneo

## 🎨 Mejores Prácticas

### Cuándo Usar Lazy Loading

✅ **SÍ usar para**:
- Modales y dialogs
- Componentes grandes que no se usan en la primera carga
- Rutas/páginas en aplicaciones multi-página
- Componentes condicionales (ej: solo para admin)

❌ **NO usar para**:
- Componentes críticos de la primera renderización
- Componentes pequeños (<10KB)
- Componentes que se usan inmediatamente

### Cómo Añadir un Nuevo Componente Lazy

1. **Importar con lazyWithPreload**:
   ```typescript
   const NewComponent = lazyWithPreload(() => import('./components/NewComponent'));
   ```

2. **Envolver con Suspense**:
   ```typescript
   <Suspense fallback={<LoadingFallback message="Cargando..." />}>
     <NewComponent />
   </Suspense>
   ```

3. **Opcional: Añadir preload en hover**:
   ```typescript
   <button onMouseEnter={() => NewComponent.preload()}>
     Abrir
   </button>
   ```

## 🔍 Debugging

### Ver qué chunks se están cargando

1. Abre DevTools → Network
2. Filtra por JS
3. Interactúa con la aplicación
4. Observa qué archivos se descargan dinámicamente

### Analizar bundle size

```bash
npm run build:analyze
```

Esto abrirá una visualización interactiva mostrando:
- Tamaño de cada chunk
- Qué módulos contiene cada chunk
- Dependencias entre chunks

## 📈 Monitoreo

### Métricas a Observar

- **First Contentful Paint (FCP)**: Tiempo hasta el primer contenido
- **Largest Contentful Paint (LCP)**: Tiempo hasta el contenido principal
- **Time to Interactive (TTI)**: Tiempo hasta que la app es interactiva
- **Bundle Size**: Tamaño total de JavaScript descargado

### Herramientas Recomendadas

- Lighthouse (Chrome DevTools)
- WebPageTest
- Bundle Analyzer (incluido)

## 🚦 Próximos Pasos

Posibles mejoras futuras:

1. **Route-based splitting**: Si la app crece a múltiples rutas
2. **Component-level splitting**: Dividir componentes grandes en sub-componentes lazy
3. **Dynamic imports en utils**: Cargar utilities solo cuando se necesitan
4. **Prefetch en idle**: Precargar componentes durante tiempo de inactividad

## 📚 Referencias

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [Web.dev: Code Splitting](https://web.dev/code-splitting-suspense/)
