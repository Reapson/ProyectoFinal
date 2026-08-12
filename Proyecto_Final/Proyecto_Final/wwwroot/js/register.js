document.getElementById("btnRegistro").addEventListener("click", async ()=>{

    const displayName = document.getElementById("displayName").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if(displayName=="" || email=="" || password==""){

        document.getElementById("mensaje").innerHTML="Complete todos los campos";

        return;

    }

    try{

        await register({

            displayName,

            email,

            password

        });

        alert("Usuario creado correctamente.");

        location.href="login.html";

    }

    catch(error){

        if(error instanceof TypeError){
            document.getElementById("mensaje").innerHTML="No se pudo conectar con el servidor. ¿Está ejecutándose?";
        }
        else{
            document.getElementById("mensaje").innerHTML=error.message;
        }

    }

});