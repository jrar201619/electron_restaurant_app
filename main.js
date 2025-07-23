// main.js
// Este es el script principal de Electron. Se ejecuta en el "main process"
// y es responsable de crear ventanas, manejar eventos del sistema, etc.

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process'); // Para lanzar el servidor Ruby

let rubyServerProcess;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200, // Ancho de la ventana
        height: 800, // Alto de la ventana
        minWidth: 800, // Ancho mínimo
        minHeight: 600, // Alto mínimo
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Opcional: para exponer APIs Node.js al renderer
            nodeIntegration: false, // Mejor práctica de seguridad: deshabilitar nodeIntegration
            contextIsolation: true, // Mejor práctica de seguridad: aislar el contexto del renderer
            // Si necesitas comunicación entre el main y el renderer, usa IPC
            // y define un preload script. Para este ejemplo simple, no es estrictamente necesario.
        }
    });

    // Carga el archivo HTML de tu interfaz de usuario
    mainWindow.loadFile('index.html');

    // Opcional: Abre las herramientas de desarrollo (DevTools)
    // mainWindow.webContents.openDevTools();
}

// Función para iniciar el servidor Ruby
function startRubyServer() {
    // Asegúrate de que tu script Ruby (ej. sinatra_backend.rb) esté en la raíz de tu proyecto
    // y que tengas la gema 'sinatra' instalada para tu versión de Ruby.
    // Ejemplo: ruby_restaurant_app/sinatra_backend.rb
    const rubyScriptPath = path.join(__dirname, 'sinatra_backend.rb'); // Ruta a tu script Ruby

    // Puedes pasar argumentos a tu script Ruby si es necesario
    rubyServerProcess = spawn('ruby', [rubyScriptPath], {
        stdio: 'inherit', // Redirige la salida del proceso Ruby a la consola de Electron
        shell: true // Permite que el comando 'ruby' se encuentre en el PATH
    });

    rubyServerProcess.on('error', (err) => {
        console.error('Error al iniciar el servidor Ruby:', err);
    });

    rubyServerProcess.on('exit', (code, signal) => {
        console.log(`Servidor Ruby terminado con código ${code} y señal ${signal}`);
        // Si el servidor Ruby se cierra inesperadamente, puedes decidir si reiniciar o no.
    });
}

// Este método será llamado cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas de navegador.
// Algunas APIs solo pueden usarse después de que ocurra este evento.
app.whenReady().then(() => {
    // Inicia el servidor Ruby antes de crear la ventana
    // startRubyServer(); // Descomenta esta línea cuando tengas tu servidor Ruby listo

    createWindow();

    app.on('activate', () => {
        // En macOS es común recrear una ventana en la aplicación cuando el
        // icono del dock es clicado y no hay otras ventanas abiertas.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
// En macOS, las aplicaciones y su barra de menú suelen permanecer activas
// hasta que el usuario cierra explícitamente con Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Manejar el cierre de la aplicación para detener el servidor Ruby
app.on('will-quit', () => {
    if (rubyServerProcess) {
        console.log('Deteniendo el servidor Ruby...');
        rubyServerProcess.kill(); // Envía una señal SIGTERM para detener el proceso Ruby
    }
});
