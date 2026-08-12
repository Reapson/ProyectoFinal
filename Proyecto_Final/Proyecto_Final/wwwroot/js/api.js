const API="/api";

function getToken(){

    return localStorage.getItem("token");

}

function authHeader(){

    return{

        "Authorization":"Bearer "+getToken(),

        "Content-Type":"application/json"

    }

}

async function extraerMensajeError(response){

    try{

        const data = await response.json();

        if(typeof data === "string") return data;

        if(Array.isArray(data)) return data.join(", ");

        if(data && data.error) return data.error;

        if(data && data.title) return data.title;

        return JSON.stringify(data);

    }

    catch{

        return `Error ${response.status}`;

    }

}

// Algunos endpoints responden 200/204 sin body (Ok() / NoContent()).
// response.json() lanza excepción en ese caso, así que leemos como texto
// primero y solo parseamos si realmente hay contenido.
async function parseJsonSiHayContenido(response){

    const texto = await response.text();

    if(!texto) return null;

    return JSON.parse(texto);

}

async function login(user){

    const response=await fetch(API+"/auth/login",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify(user)

    });

    if(!response.ok){

        throw new Error(await extraerMensajeError(response));

    }

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

    if(!response.ok){

        throw new Error(await extraerMensajeError(response));

    }

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

// Config endpoints - Admin only

async function getRoles(){

    const response = await fetch(API + "/config/roles", {

        method: "GET",

        headers: authHeader()

    });

    if(!response.ok) throw new Error(await response.text());

    return await response.json();

}

async function getUsers(){

    const response = await fetch(API + "/config/users", {

        method: "GET",

        headers: authHeader()

    });

    if(!response.ok) throw new Error(await response.text());

    return await response.json();

}

async function assignRole(userId, role){

    const response = await fetch(API + "/config/users/assign-role", {

        method: "POST",

        headers: authHeader(),

        body: JSON.stringify({ userId, role })

    });

    if(!response.ok) throw new Error(await response.text());

    return await parseJsonSiHayContenido(response);

}

async function removeRole(userId, role){

    const response = await fetch(API + "/config/users/remove-role", {

        method: "POST",

        headers: authHeader(),

        body: JSON.stringify({ userId, role })

    });

    if(!response.ok) throw new Error(await response.text());

    return await parseJsonSiHayContenido(response);

}

async function getSecrets(){

    const response = await fetch(API + "/config/secrets", {

        method: "GET",

        headers: authHeader()

    });

    if(!response.ok) throw new Error(await response.text());

    return await response.json();

}

async function upsertSecret(key, value, description){

    const response = await fetch(API + "/config/secrets", {

        method: "POST",

        headers: authHeader(),

        body: JSON.stringify({ key, value, description })

    });

    if(!response.ok) throw new Error(await response.text());

    return await parseJsonSiHayContenido(response);

}

async function deleteSecret(key){

    const response = await fetch(API + "/config/secrets/" + key, {

        method: "DELETE",

        headers: authHeader()

    });

    if(!response.ok) throw new Error(await response.text());

}

async function downloadItem(itemId){

    const response = await fetch(API + "/sourceitems/" + itemId + "/download", {

        method: "GET",

        headers: authHeader()

    });

    if(!response.ok) throw new Error(await response.text());

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = "source-item-" + itemId + ".json";

    document.body.appendChild(a);

    a.click();

    window.URL.revokeObjectURL(url);

    a.remove();

}

async function uploadItems(file){

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(API + "/sourceitems/upload", {

        method: "POST",

        headers: {

            "Authorization": "Bearer " + getToken()

        },

        body: formData

    });

    if(!response.ok) throw new Error(await response.text());

    return await response.json();

}