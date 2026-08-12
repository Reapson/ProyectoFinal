// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    const boton = document.getElementById("btnRegistro");
    const mensajeEl = document.getElementById("mensaje");
    const displayNameInput = document.getElementById("displayName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const registerForm = document.getElementById("registerForm");

    console.log("✅ Register.js cargado correctamente");

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo = "error") {
        mensajeEl.innerHTML = texto;
        mensajeEl.style.display = "block";
        mensajeEl.className = "message " + tipo;
        console.log(`[${tipo.toUpperCase()}] ${texto}`);
    }

    // Función para validar email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Evento del botón registro
    boton.addEventListener("click", async (e) => {
        e.preventDefault();

        const displayName = displayNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log("📝 Intento de registro con:", { displayName, email });

        // Validaciones
        if (!displayName || !email || !password) {
            mostrarMensaje("⚠️ Por favor completa todos los campos", "error");
            return;
        }

        if (displayName.length < 3) {
            mostrarMensaje("⚠️ El nombre debe tener al menos 3 caracteres", "error");
            return;
        }

        if (!validarEmail(email)) {
            mostrarMensaje("⚠️ El correo electrónico no es válido", "error");
            return;
        }

        if (password.length < 6) {
            mostrarMensaje("⚠️ La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        try {
            // Mostrar estado de carga
            boton.disabled = true;
            boton.textContent = "⏳ Creando cuenta...";

            console.log("🔄 Enviando solicitud de registro al servidor...");

            // Hacer la solicitud de registro
            const response = await fetch("/api/Auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ displayName, email, password })
            });

            console.log("📬 Respuesta del servidor:", response.status, response.statusText);

            const data = await response.json();
            console.log("📊 Datos recibidos:", data);

            if (!response.ok) {
                // Manejo de errores del servidor
                let errorMsg = "Error al registrar";

                if (data.error) {
                    errorMsg = data.error;
                } else if (Array.isArray(data) && data.length > 0) {
                    // Si es un array de errores
                    errorMsg = data.map(err => err.description || err).join(", ");
                } else if (typeof data === 'string') {
                    errorMsg = data;
                }

                mostrarMensaje("❌ " + errorMsg, "error");
                boton.disabled = false;
                boton.textContent = "Registrarse";
                return;
            }

            // Verificar que tenemos token
            if (!data.token) {
                mostrarMensaje("❌ No se recibió token del servidor", "error");
                boton.disabled = false;
                boton.textContent = "Registrarse";
                return;
            }

            // Guardar datos en localStorage (igual que login)
            console.log("💾 Guardando datos en localStorage...");
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email || email);
            localStorage.setItem("displayName", data.displayName || displayName);
            localStorage.setItem("roles", JSON.stringify(data.roles || ["User"]));

            console.log("✅ Datos guardados:");
            console.log("   - Token:", data.token.substring(0, 30) + "...");
            console.log("   - Email:", data.email);
            console.log("   - Display Name:", data.displayName);
            console.log("   - Roles:", data.roles);

            // Mostrar éxito
            mostrarMensaje("✅ ¡Cuenta creada exitosamente! Redirigiendo...", "success");

            // Redirigir después de 1.5 segundos (un poco más de tiempo que login)
            setTimeout(() => {
                console.log("🚀 Redirigiendo a index.html...");
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            console.error("❌ Error en registro:", error);
            mostrarMensaje("❌ Error de conexión: " + error.message, "error");
            boton.disabled = false;
            boton.textContent = "Registrarse";
        }
    });

    // Permitir registro con Enter
    registerForm.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            boton.click();
        }
    });

    console.log("🎉 Register.js inicializado correctamente");
});
