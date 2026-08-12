const boton = document.getElementById("btnLogin");
const mensajeEl = document.getElementById("mensaje");

boton.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "" || password === ""){
        mensajeEl.innerHTML = "❌ Por favor completa todos los campos";
        return;
    }

    try{
        // Mostrar estado de carga
        boton.disabled = true;
        boton.textContent = "Iniciando sesión...";
        mensajeEl.innerHTML = "";

        const respuesta = await login({
            email,
            password
        });

        localStorage.setItem("token", respuesta.token);

        localStorage.setItem("email", respuesta.email);

        localStorage.setItem("displayName", respuesta.displayName);

        localStorage.setItem("roles", JSON.stringify(respuesta.roles));

        window.location.href = "index.html";

    }
    catch(error){
        console.error("Error en login:", error);

        if(error instanceof TypeError){
            mensajeEl.innerHTML = "❌ No se pudo conectar con el servidor. ¿Está ejecutándose?";
        }
        else{
            mensajeEl.innerHTML = "❌ " + error.message;
        }

        boton.disabled = false;
        boton.textContent = "Ingresar";
    }

});