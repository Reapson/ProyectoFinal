document.getElementById("btnRegistro").addEventListener("click", async ()=>{

    const displayName = document.getElementById("displayName").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if(displayName=="" || email=="" || password==""){

        document.getElementById("mensaje").innerHTML="Complete todos los campos";

        return;

    }

    try{

        const respuesta = await register({

            displayName,

            email,

            password

        });

        alert("Usuario creado correctamente.");

        location.href="login.html";

    }

    catch{

        document.getElementById("mensaje").innerHTML="No fue posible registrar el usuario.";

    }

});