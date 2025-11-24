import { lazy, ComponentType } from 'react';

/**
 * Tipo para un componente lazy con capacidad de preload
 */
export type PreloadableComponent<T extends ComponentType<any>> = T & {
    preload: () => Promise<{ default: T }>;
};

/**
 * Crea un componente lazy con capacidad de preload
 * Esto permite cargar el componente antes de que se necesite para mejorar UX
 * 
 * @param importFunc - Función que retorna la promesa de importación dinámica
 * @returns Componente lazy con método preload()
 * 
 * @example
 * const MyComponent = lazyWithPreload(() => import('./MyComponent'));
 * 
 * // Precargar antes de mostrar
 * MyComponent.preload();
 * 
 * // Usar normalmente
 * <Suspense fallback={<Loading />}>
 *   <MyComponent />
 * </Suspense>
 */
export function lazyWithPreload<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
): PreloadableComponent<T> {
    const LazyComponent = lazy(importFunc);

    // Añadir método preload al componente lazy
    (LazyComponent as unknown as PreloadableComponent<T>).preload = importFunc;

    return LazyComponent as unknown as PreloadableComponent<T>;
}
