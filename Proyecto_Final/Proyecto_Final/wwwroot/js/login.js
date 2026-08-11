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

        if(respuesta.token){

            localStorage.setItem("token", respuesta.token);

            localStorage.setItem("email", respuesta.email);

            localStorage.setItem("displayName", respuesta.displayName);

            localStorage.setItem("roles", JSON.stringify(respuesta.roles));

            window.location.href = "index.html";

        }
        else if(respuesta.error){
            mensajeEl.innerHTML = "❌ " + respuesta.error;
            boton.disabled = false;
            boton.textContent = "Ingresar";
        }
        else{

            mensajeEl.innerHTML = "❌ Credenciales incorrectas o usuario no existe";
            boton.disabled = false;
            boton.textContent = "Ingresar";

        }

    }
    catch(error){
        console.error("Error en login:", error);
        mensajeEl.innerHTML = "❌ Error: No se pudo conectar con el servidor. ¿Está ejecutándose?";
        boton.disabled = false;
        boton.textContent = "Ingresar";
    }

});