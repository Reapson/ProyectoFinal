// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    const boton = document.getElementById("btnLogin");
    const mensajeEl = document.getElementById("mensaje");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById("loginForm");

    console.log("✅ Login.js cargado correctamente");

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo = "error") {
        mensajeEl.innerHTML = texto;
        mensajeEl.style.display = "block";
        mensajeEl.className = "message " + tipo;
        console.log(`[${tipo.toUpperCase()}] ${texto}`);
    }

    // Evento del botón login
    boton.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log("📌 Intento de login con:", { email });

        // Validaciones
        if (!email || !password) {
            mostrarMensaje("⚠️ Por favor completa todos los campos", "error");
            return;
        }

        if (!email.includes("@")) {
            mostrarMensaje("⚠️ El correo no es válido", "error");
            return;
        }

        if (password.length < 6) {
            mostrarMensaje("⚠️ La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        try {
            // Mostrar estado de carga
            boton.disabled = true;
            boton.textContent = "⏳ Iniciando sesión...";

            console.log("🔄 Enviando solicitud al servidor...");

            // Hacer la solicitud de login
            const response = await fetch("/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            console.log("📬 Respuesta del servidor:", response.status, response.statusText);

            const data = await response.json();
            console.log("📊 Datos recibidos:", data);

            if (!response.ok) {
                const errorMsg = data.error || data[0] || "Credenciales inválidas";
                mostrarMensaje("❌ " + errorMsg, "error");
                boton.disabled = false;
                boton.textContent = "Ingresar";
                return;
            }

            // Verificar que tenemos token
            if (!data.token) {
                mostrarMensaje("❌ No se recibió token del servidor", "error");
                boton.disabled = false;
                boton.textContent = "Ingresar";
                return;
            }

            // Guardar datos en localStorage
            console.log("💾 Guardando datos en localStorage...");
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email || email);
            localStorage.setItem("displayName", data.displayName || "Usuario");
            localStorage.setItem("roles", JSON.stringify(data.roles || []));

            console.log("✅ Datos guardados:");
            console.log("   - Token:", data.token.substring(0, 30) + "...");
            console.log("   - Email:", data.email);
            console.log("   - Display Name:", data.displayName);
            console.log("   - Roles:", data.roles);

            // Mostrar éxito
            mostrarMensaje("✅ ¡Inicio de sesión exitoso! Redirigiendo...", "success");

            // Redirigir después de 1 segundo
            setTimeout(() => {
                console.log("🚀 Redirigiendo a index.html...");
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {
            console.error("❌ Error en login:", error);
            mostrarMensaje("❌ Error de conexión: " + error.message, "error");
            boton.disabled = false;
            boton.textContent = "Ingresar";
        }
    });

    // Permitir login con Enter
    loginForm.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            boton.click();
        }
    });

    // Pre-llenar credenciales de demo (opcional)
    console.log("📝 Cargando credenciales de demo (opcional)...");
    // emailInput.value = "admin@proyectofinal.com";
    // passwordInput.value = "Admin123!";
});