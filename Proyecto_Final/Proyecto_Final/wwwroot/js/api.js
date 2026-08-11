const API="https://localhost:5001/api";

function getToken(){

    return localStorage.getItem("token");

}

function authHeader(){

    return{

        "Authorization":"Bearer "+getToken(),

        "Content-Type":"application/json"

    }

}

async function login(user){

    const response=await fetch(API+"/auth/login",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify(user)

    });

    return await response.json();

}

async function register(user){

    const response=await fetch(API+"/auth/register",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify(user)

    });

    return await response.json();

}

async function getItems(){

    const response=await fetch(API+"/sourceitems");

    return await response.json();

}

async function guardar(item){

    const response = await fetch(API + "/sourceitems",{

        method:"POST",

        headers:authHeader(),

        body:JSON.stringify(item)

    });

    if(!response.ok){

        throw new Error(await response.text());

    }

    return await response.json();

}

async function crearFuente(fuente){

    const response = await fetch(API + "/sources",{

        method:"POST",

        headers:authHeader(),

        body:JSON.stringify(fuente)

    });

    if(!response.ok){

        throw new Error(await response.text());

    }

    return await response.json();

}