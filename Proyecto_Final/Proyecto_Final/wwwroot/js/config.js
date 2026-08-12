// Estado global
let allRoles = [];
let allUsers = [];
let allSecrets = [];
let allItems = [];
let confirmCallback = null;

// Elementos del DOM
const usuarioEl = document.getElementById('usuario');
const logoutBtn = document.getElementById('logout');
const btnVolver = document.getElementById('btnVolver');

// Gestión de roles
const selectUser = document.getElementById('selectUser');
const selectRole = document.getElementById('selectRole');
const btnAssignRole = document.getElementById('btnAssignRole');
const usersTable = document.getElementById('usersTable');

// Gestión de secrets
const secretKey = document.getElementById('secretKey');
const secretValue = document.getElementById('secretValue');
const secretDescription = document.getElementById('secretDescription');
const btnUpsertSecret = document.getElementById('btnUpsertSecret');
const secretsTable = document.getElementById('secretsTable');

// Upload/Download
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadResult = document.getElementById('uploadResult');
const itemsList = document.getElementById('itemsList');

// Modal
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Toast
const toast = document.getElementById('toast');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (!estaLogueado() || !esAdmin()) {
        window.location.href = 'login.html';
        return;
    }

    mostrarUsuario();
    cargarDatos();
    configurarEventos();
});

function mostrarUsuario() {
    const token = obtenerToken();
    const payload = parseJwt(token);
    if (payload) {
        usuarioEl.textContent = `👤 ${payload.email || 'Usuario'}`;
    }
}

function configurarEventos() {
    logoutBtn.addEventListener('click', cerrarSesion);
    btnVolver.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    btnAssignRole.addEventListener('click', asignarRol);
    btnUpsertSecret.addEventListener('click', guardarSecret);

    // Upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            subirArchivo(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            subirArchivo(e.target.files[0]);
        }
    });

    // Modal
    confirmBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        ocultarModal();
    });
    cancelBtn.addEventListener('click', ocultarModal);
}

async function cargarDatos() {
    try {
        await Promise.all([
            cargarRoles(),
            cargarUsuarios(),
            cargarSecrets(),
            cargarItems()
        ]);
    } catch (error) {
        mostrarToast('Error al cargar los datos: ' + error.message, 'error');
    }
}

// ==================== ROLES ====================

async function cargarRoles() {
    try {
        allRoles = await getRoles();
        selectRole.innerHTML = '<option value="">-- Selecciona un rol --</option>';
        allRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            selectRole.appendChild(option);
        });
    } catch (error) {
        mostrarToast('Error al cargar roles: ' + error.message, 'error');
    }
}

async function cargarUsuarios() {
    try {
        allUsers = await getUsers();
        actualizarTablaUsuarios();
        actualizarSelectUsuarios();
    } catch (error) {
        mostrarToast('Error al cargar usuarios: ' + error.message, 'error');
    }
}

function actualizarSelectUsuarios() {
    selectUser.innerHTML = '<option value="">-- Selecciona un usuario --</option>';
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.displayName} (${user.email})`;
        selectUser.appendChild(option);
    });
}

function actualizarTablaUsuarios() {
    const tbody = usersTable.querySelector('tbody');
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.displayName)}</td>
            <td>
                ${user.roles.length > 0
                    ? user.roles.map(role => `<span class="badge ${role.toLowerCase()}">${role}</span>`).join('')
                    : '<span style="color: #9ca3af;">Sin roles</span>'
                }
            </td>
            <td class="actions">
                ${user.roles.length > 0 ? user.roles.map(role => `
                    <button class="btn btn-remove" onclick="removerRol('${user.id}', '${role}')">
                        Quitar ${role}
                    </button>
                `).join('') : ''}
            </td>
        </tr>
    `).join('');
}

async function asignarRol() {
    const userId = selectUser.value;
    const role = selectRole.value;

    if (!userId || !role) {
        mostrarToast('Por favor selecciona un usuario y un rol', 'warning');
        return;
    }

    const user = allUsers.find(u => u.id === userId);
    if (user.roles.includes(role)) {
        mostrarToast(`El usuario ya tiene el rol ${role}`, 'warning');
        return;
    }

    try {
        await assignRole(userId, role);
        mostrarToast(`Rol ${role} asignado exitosamente`, 'success');
        selectUser.value = '';
        selectRole.value = '';
        await cargarUsuarios();
    } catch (error) {
        mostrarToast('Error al asignar rol: ' + error.message, 'error');
    }
}

async function removerRol(userId, role) {
    const user = allUsers.find(u => u.id === userId);
    mostrarConfirmacion(
        `Remover rol ${role}`,
        `¿Estás seguro de que deseas quitar el rol ${role} de ${user.email}?`,
        async () => {
            try {
                await removeRole(userId, role);
                mostrarToast(`Rol ${role} removido exitosamente`, 'success');
                await cargarUsuarios();
            } catch (error) {
                mostrarToast('Error al remover rol: ' + error.message, 'error');
            }
        }
    );
}

// ==================== SECRETS ====================

async function cargarSecrets() {
    try {
        allSecrets = await getSecrets();
        actualizarTablaSecrets();
    } catch (error) {
        mostrarToast('Error al cargar secrets: ' + error.message, 'error');
    }
}

function actualizarTablaSecrets() {
    const tbody = secretsTable.querySelector('tbody');
    if (allSecrets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay secrets configurados</td></tr>';
        return;
    }

    tbody.innerHTML = allSecrets.map(secret => `
        <tr>
            <td><code>${escapeHtml(secret.key)}</code></td>
            <td>${escapeHtml(secret.description || 'Sin descripción')}</td>
            <td><code>${secret.maskedValue}</code></td>
            <td>${new Date(secret.updatedAt).toLocaleString()}</td>
            <td class="actions">
                <button class="btn btn-remove" onclick="eliminarSecret('${secret.key}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

async function guardarSecret() {
    const key = secretKey.value.trim();
    const value = secretValue.value.trim();
    const description = secretDescription.value.trim();

    if (!key || !value) {
        mostrarToast('La clave y el valor del secret son requeridos', 'warning');
        return;
    }

    try {
        await upsertSecret(key, value, description);
        mostrarToast('Secret guardado exitosamente', 'success');
        secretKey.value = '';
        secretValue.value = '';
        secretDescription.value = '';
        await cargarSecrets();
    } catch (error) {
        mostrarToast('Error al guardar secret: ' + error.message, 'error');
    }
}

async function eliminarSecret(key) {
    mostrarConfirmacion(
        'Eliminar Secret',
        `¿Estás seguro de que deseas eliminar el secret "${key}"?`,
        async () => {
            try {
                await deleteSecret(key);
                mostrarToast('Secret eliminado exitosamente', 'success');
                await cargarSecrets();
            } catch (error) {
                mostrarToast('Error al eliminar secret: ' + error.message, 'error');
            }
        }
    );
}

// ==================== ITEMS (DOWNLOAD/UPLOAD) ====================

async function cargarItems() {
    try {
        const items = await getItems();
        // Solo items realmente guardados en la BD tienen "id"; los items en
        // vivo (fallback cuando no hay nada guardado) no se pueden descargar.
        allItems = items.filter(item => item.id !== undefined && item.id !== null);
        actualizarListaItems();
    } catch (error) {
        mostrarToast('Error al cargar items: ' + error.message, 'error');
    }
}

function actualizarListaItems() {
    if (allItems.length === 0) {
        itemsList.innerHTML = '<p class="loading">No hay items guardados</p>';
        return;
    }

    itemsList.innerHTML = allItems.map(item => `
        <div class="item-card">
            <h4>${escapeHtml(item.item?.title || 'Sin título')}</h4>
            <p>${escapeHtml(item.item?.description || 'Sin descripción').substring(0, 100)}</p>
            <div class="meta">
                <span>${item.sourceName || 'Fuente desconocida'}</span>
                <span>${new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="actions">
                <button class="btn btn-download" onclick="descargarItem(${item.id})">
                    📥 Descargar
                </button>
            </div>
        </div>
    `).join('');
}

async function descargarItem(itemId) {
    try {
        await downloadItem(itemId);
        mostrarToast('Item descargado exitosamente', 'success');
    } catch (error) {
        mostrarToast('Error al descargar item: ' + error.message, 'error');
    }
}

async function subirArchivo(file) {
    if (!file.type.includes('json')) {
        mostrarToast('Por favor sube un archivo JSON válido', 'error');
        return;
    }

    uploadResult.classList.add('hidden');

    try {
        const resultado = await uploadItems(file);
        mostrarToast('Item subido exitosamente', 'success');

        mostrarResultadoUpload(resultado, false);
        fileInput.value = '';
        await cargarItems();
    } catch (error) {
        mostrarResultadoUpload(null, true, error.message);
    }
}

function mostrarResultadoUpload(data, esError = false, errorMsg = '') {
    uploadResult.classList.remove('hidden');

    if (esError) {
        uploadResult.className = 'upload-result error';
        uploadResult.innerHTML = `
            <h4>❌ Error al subir el archivo</h4>
            <p>${escapeHtml(errorMsg)}</p>
        `;
    } else {
        uploadResult.className = 'upload-result';
        uploadResult.innerHTML = `
            <h4>✅ Item subido exitosamente</h4>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Título:</strong> ${escapeHtml(data.item?.title || 'Sin título')}</p>
            <p><strong>Fuente:</strong> ${escapeHtml(data.sourceName || 'Desconocida')}</p>
            <p><strong>Fecha:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
        `;
    }
}

// ==================== UTILIDADES ====================

function mostrarConfirmacion(titulo, mensaje, callback) {
    confirmTitle.textContent = titulo;
    confirmMessage.textContent = mensaje;
    confirmCallback = callback;
    confirmModal.classList.remove('hidden');
}

function ocultarModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
}

function mostrarToast(mensaje, tipo = 'success') {
    toast.textContent = mensaje;
    toast.className = `toast ${tipo}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
