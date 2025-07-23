// renderer.js
// Este script se ejecuta en el contexto de la ventana del navegador (el "renderer process").
// Maneja la lógica de la interfaz de usuario y la comunicación con el backend (Ruby).

const appContent = document.getElementById('appContent');
const messageBox = document.getElementById('messageBox');

// Función para mostrar mensajes al usuario
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800');
    }
    messageBox.classList.remove('hidden');
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

// --- Funciones para cargar contenido dinámicamente ---

// Simula una llamada al backend Ruby (ej. Sinatra API)
async function fetchData(endpoint) {
    try {
        // En una aplicación real, aquí harías un 'fetch' a tu servidor Ruby local.
        // Por ejemplo: const response = await fetch(`http://localhost:4567/${endpoint}`);
        // const data = await response.json();
        // return data;

        // Simulación de datos para demostración
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula un retraso de red
        if (endpoint === 'categories') {
            return [
                { id: 1, name: 'Bebidas' },
                { id: 2, name: 'Comida Principal' },
                { id: 3, name: 'Postres' }
            ];
        } else if (endpoint === 'products') {
            return [
                { id: 101, name: 'Café Expreso', category_id: 1, price: 2.50, stock: 100 },
                { id: 102, name: 'Pizza Margarita', category_id: 2, price: 12.00, stock: 50 },
                { id: 103, name: 'Tarta de Chocolate', category_id: 3, price: 5.00, stock: 30 }
            ];
        }
        return [];
    } catch (error) {
        console.error('Error al obtener datos:', error);
        showMessage('Error al cargar los datos. Inténtalo de nuevo.', 'error');
        return [];
    }
}

// Carga la vista de gestión de categorías
async function loadCategoriesView() {
    appContent.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Gestión de Categorías</h2>
        <div class="form-group">
            <label for="categoryName" class="form-label">Nombre de Categoría:</label>
            <input type="text" id="categoryName" class="form-input" placeholder="Ej. Bebidas">
        </div>
        <button id="btnAddCategory" class="form-button">Agregar Categoría</button>

        <h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">Lista de Categorías</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="table-header">ID</th>
                        <th class="table-header">Nombre</th>
                        <th class="table-header">Acciones</th>
                    </tr>
                </thead>
                <tbody id="categoriesTableBody" class="bg-white divide-y divide-gray-200">
                    <!-- Las categorías se cargarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const categories = await fetchData('categories');
    const tableBody = document.getElementById('categoriesTableBody');
    tableBody.innerHTML = ''; // Limpiar antes de añadir

    if (categories.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="table-cell text-center text-gray-500">No hay categorías.</td></tr>`;
    } else {
        categories.forEach(category => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="table-cell">${category.id}</td>
                <td class="table-cell">${category.name}</td>
                <td class="table-cell">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="editCategory(${category.id}, '${category.name}')">Editar</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteCategory(${category.id})">Eliminar</button>
                </td>
            `;
        });
    }

    document.getElementById('btnAddCategory').addEventListener('click', addCategory);
}

// Carga la vista de gestión de productos
async function loadProductsView() {
    appContent.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Gestión de Productos</h2>
        <div class="form-group">
            <label for="productName" class="form-label">Nombre del Producto:</label>
            <input type="text" id="productName" class="form-input" placeholder="Ej. Hamburguesa Clásica">
        </div>
        <div class="form-group">
            <label for="productCategory" class="form-label">Categoría:</label>
            <select id="productCategory" class="form-input"></select>
        </div>
        <div class="form-group">
            <label for="productPrice" class="form-label">Precio:</label>
            <input type="number" step="0.01" id="productPrice" class="form-input" placeholder="Ej. 9.99">
        </div>
        <div class="form-group">
            <label for="productStock" class="form-label">Stock:</label>
            <input type="number" id="productStock" class="form-input" placeholder="Ej. 50">
        </div>
        <button id="btnAddProduct" class="form-button">Agregar Producto</button>

        <h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3">Lista de Productos</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="table-header">ID</th>
                        <th class="table-header">Nombre</th>
                        <th class="table-header">Categoría</th>
                        <th class="table-header">Precio</th>
                        <th class="table-header">Stock</th>
                        <th class="table-header">Acciones</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody" class="bg-white divide-y divide-gray-200">
                    <!-- Los productos se cargarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const categories = await fetchData('categories');
    const productCategorySelect = document.getElementById('productCategory');
    productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        productCategorySelect.appendChild(option);
    });

    const products = await fetchData('products');
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="table-cell text-center text-gray-500">No hay productos.</td></tr>`;
    } else {
        products.forEach(product => {
            const categoryName = categories.find(cat => cat.id === product.category_id)?.name || 'Desconocida';
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="table-cell">${product.id}</td>
                <td class="table-cell">${product.name}</td>
                <td class="table-cell">${categoryName}</td>
                <td class="table-cell">$${product.price.toFixed(2)}</td>
                <td class="table-cell">${product.stock}</td>
                <td class="table-cell">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="editProduct(${product.id}, '${product.name}')">Editar</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteProduct(${product.id})">Eliminar</button>
                </td>
            `;
        });
    }

    document.getElementById('btnAddProduct').addEventListener('click', addProduct);
}

// Carga la vista de gestión de ventas (ejemplo simple)
function loadSalesView() {
    appContent.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Gestión de Ventas</h2>
        <p class="text-gray-600">Aquí podrás registrar nuevas ventas y ver el historial.</p>
        <!-- Formulario de venta y lista de ventas -->
        <button class="form-button">Registrar Nueva Venta</button>
    `;
}

// Carga la vista de reportes (ejemplo simple)
function loadReportsView() {
    appContent.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Reportes</h2>
        <p class="text-gray-600">Genera reportes de ventas, stock y más.</p>
        <!-- Opciones de reportes -->
        <button class="form-button">Generar Reporte de Ventas</button>
    `;
}

// --- Funciones de acción (simuladas) ---

async function addCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    if (!categoryName) {
        showMessage('El nombre de la categoría no puede estar vacío.', 'error');
        return;
    }
    // Aquí enviarías los datos a tu backend Ruby
    // Ejemplo: await fetch('http://localhost:4567/categories', { method: 'POST', body: JSON.stringify({ name: categoryName }) });
    showMessage(`Categoría "${categoryName}" agregada (simulado).`, 'success');
    document.getElementById('categoryName').value = ''; // Limpiar campo
    loadCategoriesView(); // Recargar la lista
}

function editCategory(id, name) {
    showMessage(`Editar categoría ID: ${id}, Nombre: ${name} (simulado).`, 'success');
    // Lógica para cargar un formulario de edición
}

function deleteCategory(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría ID: ${id}?`)) {
        // Aquí enviarías la solicitud de eliminación a tu backend Ruby
        // Ejemplo: await fetch(`http://localhost:4567/categories/${id}`, { method: 'DELETE' });
        showMessage(`Categoría ID: ${id} eliminada (simulado).`, 'success');
        loadCategoriesView(); // Recargar la lista
    }
}

async function addProduct() {
    const productName = document.getElementById('productName').value.trim();
    const productCategory = document.getElementById('productCategory').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productStock = parseInt(document.getElementById('productStock').value);

    if (!productName || !productCategory || isNaN(productPrice) || isNaN(productStock)) {
        showMessage('Por favor, completa todos los campos del producto.', 'error');
        return;
    }
    // Aquí enviarías los datos a tu backend Ruby
    showMessage(`Producto "${productName}" agregado (simulado).`, 'success');
    // Limpiar campos
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    loadProductsView(); // Recargar la lista
}

function editProduct(id, name) {
    showMessage(`Editar producto ID: ${id}, Nombre: ${name} (simulado).`, 'success');
}

function deleteProduct(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto ID: ${id}?`)) {
        showMessage(`Producto ID: ${id} eliminado (simulado).`, 'success');
        loadProductsView();
    }
}


// --- Event Listeners para la navegación ---
document.getElementById('btnHome').addEventListener('click', () => {
    appContent.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Bienvenido al Sistema de Gestión</h2>
        <p class="text-gray-600">Utiliza el menú de navegación para gestionar categorías, productos, ventas y reportes.</p>
    `;
});
document.getElementById('btnCategories').addEventListener('click', loadCategoriesView);
document.getElementById('btnProducts').addEventListener('click', loadProductsView);
document.getElementById('btnSales').addEventListener('click', loadSalesView);
document.getElementById('btnReports').addEventListener('click', loadReportsView);

// Cargar la vista de inicio al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Puedes cargar una vista específica al inicio, o dejar el mensaje de bienvenida
    // loadCategoriesView(); // Ejemplo: cargar categorías al inicio
});
