function guardarToken(token){

    localStorage.setItem("token",token);

}

function obtenerToken(){

    return localStorage.getItem("token");

}

function cerrarSesion(){

    localStorage.removeItem("token");

    location.href="login.html";

}

function estaLogueado(){

    return obtenerToken()!=null;

}

function parseJwt(token){

    try{

        return JSON.parse(atob(token.split('.')[1]));

    }

    catch{

        return null;

    }

}

function obtenerRol(){

    const token=obtenerToken();

    if(token==null)

        return null;

    const payload=parseJwt(token);

    if(payload==null)

        return null;

    return payload.role
        ||payload.Role
        ||payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
}

function esAdmin(){

    return obtenerRol()=="Admin";

}