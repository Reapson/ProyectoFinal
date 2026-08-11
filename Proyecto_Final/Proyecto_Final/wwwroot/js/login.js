const boton = document.getElementById("btnLogin");

boton.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(email === "" || password === ""){
        document.getElementById("mensaje").innerHTML = "Complete todos los campos";
        return;
    }

    try{

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
        else{

            document.getElementById("mensaje").innerHTML = "Credenciales incorrectas";

        }

    }
    catch{

        document.getElementById("mensaje").innerHTML = "No fue posible iniciar sesión.";

    }

});