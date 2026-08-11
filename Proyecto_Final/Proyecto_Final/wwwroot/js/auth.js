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

function obtenerRoles(){

    const token=obtenerToken();

    if(token==null)

        return [];

    const payload=parseJwt(token);

    if(payload==null)

        return [];

    const rolesClaim = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];
    
    if(Array.isArray(rolesClaim)) {
        return rolesClaim;
    } else if(rolesClaim) {
        return [rolesClaim];
    }
    
    return [];
}

function obtenerRol(){

    const roles=obtenerRoles();

    return roles.length > 0 ? roles[0] : null;
}

function esAdmin(){

    return obtenerRoles().includes("Admin");

}