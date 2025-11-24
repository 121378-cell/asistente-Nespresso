// Script de prueba para verificar Dark Mode
// Copia y pega esto en la consola del navegador (F12 → Console)

console.log('=== VERIFICACIÓN DE DARK MODE ===');

// 1. Verificar que el elemento HTML tiene la clase dark
const htmlElement = document.documentElement;
console.log('1. Clase "dark" en <html>:', htmlElement.classList.contains('dark'));
console.log('   Clases actuales:', htmlElement.className);

// 2. Verificar localStorage
const savedTheme = localStorage.getItem('theme');
console.log('2. Tema guardado en localStorage:', savedTheme);

// 3. Verificar que el botón de tema existe
const themeButton = document.querySelector('button[title*="modo"]');
console.log('3. Botón de tema encontrado:', !!themeButton);

// 4. Simular click en el botón
if (themeButton) {
    console.log('4. Haciendo click en el botón...');
    themeButton.click();

    setTimeout(() => {
        console.log('   Después del click:');
        console.log('   - Clase "dark":', htmlElement.classList.contains('dark'));
        console.log('   - localStorage:', localStorage.getItem('theme'));
    }, 500);
} else {
    console.log('4. ❌ No se encontró el botón de tema');
}

// 5. Verificar estilos de ChatMessage
setTimeout(() => {
    const messages = document.querySelectorAll('[class*="bg-white"], [class*="bg-gray"]');
    console.log('5. Mensajes encontrados:', messages.length);
    if (messages.length > 0) {
        console.log('   Clases del primer mensaje:', messages[0].className);
    }
}, 1000);

console.log('=== FIN DE VERIFICACIÓN ===');
