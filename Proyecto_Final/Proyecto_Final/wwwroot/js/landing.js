// Datos demo para que se vea la página sin login
const demoItems = [
    {
        sourceId: 1,
        item: {
            title: "Nueva tecnología revoluciona la industria",
            description: "Se anuncia un avance tecnológico que podría cambiar el mercado",
            author: "Tech News Daily",
            publishedAt: new Date().toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
            url: "https://example.com/1"
        }
    },
    {
        sourceId: 2,
        item: {
            title: "Tendencias en desarrollo web 2024",
            description: "Descubre las herramientas y tecnologías más populares del año",
            author: "Web Dev Magazine",
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
            url: "https://example.com/2"
        }
    },
    {
        sourceId: 3,
        item: {
            title: "Seguridad en aplicaciones: mejores prácticas",
            description: "Aprende cómo proteger tus aplicaciones de las amenazas más comunes",
            author: "Security Weekly",
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f70570ec0?w=400&h=250&fit=crop",
            url: "https://example.com/3"
        }
    },
    {
        sourceId: 4,
        item: {
            title: ".NET 8: Nuevas características impresionantes",
            description: "Explora todas las novedades de la última versión de .NET",
            author: "Microsoft Blog",
            publishedAt: new Date(Date.now() - 259200000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
            url: "https://example.com/4"
        }
    },
    {
        sourceId: 5,
        item: {
            title: "Inteligencia Artificial en el desarrollo",
            description: "Cómo la IA está transformando la forma en que desarrollamos software",
            author: "AI Today",
            publishedAt: new Date(Date.now() - 345600000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1677442d019cecf8f80f1a18a41db7ce96a0ee1d?w=400&h=250&fit=crop",
            url: "https://example.com/5"
        }
    },
    {
        sourceId: 6,
        item: {
            title: "Cloud Computing: El futuro de la infraestructura",
            description: "Por qué cada vez más empresas migran a la nube",
            author: "Cloud Insights",
            publishedAt: new Date(Date.now() - 432000000).toISOString(),
            imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
            url: "https://example.com/6"
        }
    }
];

let allUsersAdmin = [];
let allRolesAdmin = [];
let contenedor; // Se inicializa en DOMContentLoaded

document.addEventListener("DOMContentLoaded", () => {
    contenedor = document.getElementById("itemsContainer");
    const displayName = localStorage.getItem("displayName") ?? "Demo User";

    console.log("Landing.js iniciado");
    console.log("Token presente:", !!localStorage.getItem("token"));
    console.log("Usuario:", displayName);
    console.log("Roles:", localStorage.getItem("roles"));

    document.getElementById("usuario").innerHTML = "👤 " + displayName;

    document.getElementById("logout").onclick = () => {
        cerrarSesion();
    };

    if (esAdmin()) {
        console.log("Usuario es Admin - mostrando panel");
        document.getElementById("adminPanel").style.display = "block";
        document.getElementById("btnConfig").style.display = "block";
        console.log("Llamando a cargarUsuariosAdmin...");
        cargarUsuariosAdmin();
    } else {
        console.log("Usuario NO es Admin");
    }

    cargarNoticias();
    cargarTrendencias();

    // Evento del botón actualizar
    const btnRefresh = document.getElementById("btnRefreshUsers");
    if (btnRefresh) {
        console.log("✅ Botón de actualizar encontrado");
        btnRefresh.addEventListener("click", async () => {
            console.log("Actualizando usuarios...");
            await cargarUsuariosAdmin();
            alert("✅ Lista de usuarios actualizada");
        });
    } else {
        console.log("⚠️ Botón de actualizar NO encontrado");
    }
});

async function cargarNoticias() {
    try {
        let noticias = [];
        
        console.log("Intentando cargar noticias desde la API...");
        
        // Intentar cargar desde la API
        try {
            const response = await fetch("https://localhost:7200/api/sourceitems");
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            noticias = await response.json();
            console.log("✅ Noticias cargadas desde API:", noticias.length);
        } catch (error) {
            console.warn("❌ No se pudo cargar desde la API:", error.message);
            console.log("Usando datos demo...");
            noticias = demoItems;
        }

        contenedor.innerHTML = "";

        if (noticias.length === 0) {
            contenedor.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
                    <p style="font-size: 18px; margin-bottom: 10px;">📭 No hay noticias disponibles</p>
                    <p style="font-size: 14px;">Intenta agregar nuevas fuentes o conectarte al servidor</p>
                </div>
            `;
            return;
        }

        noticias.forEach(n => {
            const item = n.item;
            const card = document.createElement("div");
            card.className = "item-card";
            
            const fecha = item.publishedAt 
                ? new Date(item.publishedAt).toLocaleDateString('es-ES')
                : 'Sin fecha';

            card.innerHTML = `
                <div class="item-header">
                    <h3>${item.title}</h3>
                    <p>${item.description ?? 'Sin descripción'}</p>
                </div>
                <div class="item-body">
                    <p><strong>👤 Autor:</strong> ${item.author ?? 'Desconocido'}</p>
                </div>
                <div class="item-footer">
                    <span>📅 ${fecha}</span>
                    <div>
                        <button class="read" style="background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 8px;">
                            Leer más
                        </button>
                        ${estaLogueado() ? `
                            <button class="download" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-right: 8px;">
                                📥 Descargar
                            </button>
                            <button class="save" style="background: #764ba2; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                💾 Guardar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

            card.querySelector(".read").onclick = () => {
                if (item.url) {
                    window.open(item.url, "_blank");
                } else {
                    alert("No hay URL disponible para esta noticia");
                }
            };

            if (estaLogueado()) {
                const downloadBtn = card.querySelector(".download");
                const saveBtn = card.querySelector(".save");
                
                if (downloadBtn) {
                    downloadBtn.onclick = async () => {
                        try {
                            await downloadItem(n.id);
                            alert("✅ Descargado correctamente");
                        } catch (error) {
                            console.error("Error al descargar:", error);
                            alert("❌ Error al descargar: " + error.message);
                        }
                    };
                }
                
                if (saveBtn) {
                    saveBtn.onclick = async () => {
                        try {
                            await guardar({
                                sourceId: n.sourceId,
                                item: item
                            });
                            alert("✅ Noticia guardada correctamente");
                        } catch (error) {
                            console.error("Error al guardar:", error);
                            alert("❌ No fue posible guardar la noticia");
                        }
                    };
                }
            }

            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar noticias:", error);
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #e74c3c;">
                <p>⚠️ Error al cargar las noticias</p>
                <p style="font-size: 12px; color: #999;">Error: ${error.message}</p>
            </div>
        `;
    }
}

document.getElementById("btnFuente").onclick = async () => {
    try {
        const fuente = {
            name: document.getElementById("sourceName").value,
            url: document.getElementById("sourceUrl").value,
            description: document.getElementById("sourceDescription").value,
            componentType: document.getElementById("componentType").value,
            requiresSecret: document.getElementById("requiresSecret").checked,
            secretKeyName: document.getElementById("secretKeyName").value
        };

        await crearFuente(fuente);
        alert("✅ Fuente agregada correctamente");
        
        document.getElementById("sourceName").value = "";
        document.getElementById("sourceUrl").value = "";
        document.getElementById("sourceDescription").value = "";
        document.getElementById("componentType").value = "";
        document.getElementById("requiresSecret").checked = false;
        document.getElementById("secretKeyName").value = "";

    } catch (error) {
        alert("❌ " + error.message);
    }
};

// Cargar tendencias
async function cargarTrendencias() {
    try {
        const trendingContainer = document.getElementById("trendingContainer");
        
        if (!trendingContainer) {
            return;
        }

        trendingContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">⏳ Cargando tendencias...</p>';

        const response = await fetch("https://localhost:7200/api/trending");
        if (!response.ok) throw new Error("Error cargando tendencias");
        
        const trending = await response.json();

        trendingContainer.innerHTML = "";

        if (!trending || trending.length === 0) {
            trendingContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">📊 No hay tendencias aún</p>';
            return;
        }

        trending.slice(0, 6).forEach(trend => {
            const card = document.createElement("div");
            card.className = "trending-card";
            
            // Determinar sentimiento
            const sentiment = trend.sentiment || 0;
            let sentimentLabel = "Neutro 😐";
            let sentimentClass = "sentiment-neutral";
            
            if (sentiment > 0.3) {
                sentimentLabel = "Positivo 😊";
                sentimentClass = "sentiment-positive";
            } else if (sentiment < -0.3) {
                sentimentLabel = "Negativo 😞";
                sentimentClass = "sentiment-negative";
            }

            card.innerHTML = `
                <div class="trending-keyword">${trend.keyword}</div>
                <div class="trending-count">${trend.count}</div>
                <div style="font-size: 12px; opacity: 0.9;">menciones</div>
                <div class="trending-sentiment">
                    <span class="${sentimentClass}">${sentimentLabel}</span>
                </div>
            `;

            trendingContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar tendencias:", error);
        const trendingContainer = document.getElementById("trendingContainer");
        if (trendingContainer) {
            trendingContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">⚠️ No hay tendencias disponibles</p>';
        }
    }
}

// ==================== GESTIÓN RÁPIDA DE USUARIOS ====================

async function cargarUsuariosAdmin() {
    try {
        console.log("Cargando usuarios para admin...");
        
        // Cargar usuarios y roles en paralelo
        const [usuarios, roles] = await Promise.all([
            getUsers(),
            getRoles()
        ]);
        
        allUsersAdmin = usuarios;
        allRolesAdmin = roles;
        
        console.log("✅ Usuarios cargados:", usuarios.length);
        console.log("✅ Roles cargados:", roles.length);
        
        actualizarSelectUsuarios();
        mostrarListaUsuarios();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}

function actualizarSelectUsuarios() {
    const selectUser = document.getElementById("selectUserQuick");
    if (!selectUser) return;
    
    selectUser.innerHTML = '<option value="">-- Selecciona un usuario --</option>';
    allUsersAdmin.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.displayName} (${user.email})`;
        selectUser.appendChild(option);
    });
}

function mostrarListaUsuarios() {
    const usersList = document.getElementById("usersList");
    if (!usersList) return;
    
    if (allUsersAdmin.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: #999;">No hay usuarios</p>';
        return;
    }

    usersList.innerHTML = allUsersAdmin.map(user => {
        const rolesHTML = user.roles.length > 0
            ? user.roles.map(role => `<span class="role-badge ${role.toLowerCase()}">${role}</span>`).join('')
            : '<span style="color: #999; font-size: 12px;">Sin roles</span>';

        return `
            <div class="user-card">
                <div class="user-name">👤 ${user.displayName}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-roles">${rolesHTML}</div>
                <div class="user-actions">
                    <button class="btn-small btn-assign" onclick="abrirMenuRoles('${user.id}', '${user.displayName}')">
                        ➕ Agregar Rol
                    </button>
                    ${user.roles.length > 0 ? `
                        <button class="btn-small btn-remove" onclick="abrirMenuQuitarRol('${user.id}', '${user.displayName}')">
                            ➖ Quitar Rol
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function abrirMenuRoles(userId, displayName) {
    const rolesDisponibles = allRolesAdmin.filter(role => {
        const user = allUsersAdmin.find(u => u.id === userId);
        return !user.roles.includes(role);
    });

    if (rolesDisponibles.length === 0) {
        alert(`${displayName} ya tiene todos los roles disponibles`);
        return;
    }

    const rolSeleccionado = prompt(
        `Selecciona un rol para ${displayName}:\n\n${rolesDisponibles.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
        "1"
    );

    if (!rolSeleccionado) return;

    const indice = parseInt(rolSeleccionado) - 1;
    if (indice < 0 || indice >= rolesDisponibles.length) {
        alert("Opción inválida");
        return;
    }

    const rolElegido = rolesDisponibles[indice];
    asignarRolAdmin(userId, rolElegido, displayName);
}

function abrirMenuQuitarRol(userId, displayName) {
    const user = allUsersAdmin.find(u => u.id === userId);
    
    if (user.roles.length === 0) {
        alert(`${displayName} no tiene roles que quitar`);
        return;
    }

    const rolSeleccionado = prompt(
        `Selecciona un rol para quitar de ${displayName}:\n\n${user.roles.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
        "1"
    );

    if (!rolSeleccionado) return;

    const indice = parseInt(rolSeleccionado) - 1;
    if (indice < 0 || indice >= user.roles.length) {
        alert("Opción inválida");
        return;
    }

    const rolElegido = user.roles[indice];
    quitarRolAdmin(userId, rolElegido, displayName);
}

async function asignarRolAdmin(userId, role, displayName) {
    try {
        console.log(`Asignando rol ${role} a ${displayName}...`);
        await assignRole(userId, role);
        console.log(`✅ Rol ${role} asignado a ${displayName}`);
        alert(`✅ Rol ${role} asignado a ${displayName}`);
        await cargarUsuariosAdmin();
    } catch (error) {
        console.error("Error asignando rol:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

async function quitarRolAdmin(userId, role, displayName) {
    try {
        console.log(`Quitando rol ${role} de ${displayName}...`);
        await removeRole(userId, role);
        console.log(`✅ Rol ${role} quitado de ${displayName}`);
        alert(`✅ Rol ${role} quitado de ${displayName}`);
        await cargarUsuariosAdmin();
    } catch (error) {
        console.error("Error quitando rol:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Evento del botón actualizar
if (document.getElementById("btnRefreshUsers")) {
    document.getElementById("btnRefreshUsers").addEventListener("click", async () => {
        console.log("Actualizando usuarios...");
        await cargarUsuariosAdmin();
        alert("✅ Lista de usuarios actualizada");
    });
}