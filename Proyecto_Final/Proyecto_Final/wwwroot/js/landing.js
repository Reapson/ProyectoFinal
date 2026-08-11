const contenedor = document.getElementById("items");

document.getElementById("usuario").innerHTML =
    localStorage.getItem("displayName") ?? "Invitado";

document.getElementById("logout").onclick = () => {

    cerrarSesion();

};

if (esAdmin()) {

    document.getElementById("adminPanel").style.display = "block";

}

cargarNoticias();

async function cargarNoticias() {

    const noticias = await getItems();

    contenedor.innerHTML = "";

    noticias.forEach(n => {

        const item = n.item;

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

<img src="${item.imageUrl || 'https://placehold.co/600x300?text=Sin+Imagen'}">

<h2>${item.title}</h2>

<p>${item.description ?? ''}</p>

<small>
👤 ${item.author ?? 'Autor desconocido'}
</small>

<small>
 ${item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString()
                : 'Sin fecha'
            }
</small>

<div class="buttons">

<button class="read">
Leer más
</button>

${estaLogueado()
                ?
                '<button class="save">Guardar</button>'
                :
                ''
            }

</div>

`;

        card.querySelector(".read").onclick = () => {

            if (item.url) {

                window.open(item.url, "_blank");

            }

        };

        if (estaLogueado()) {

            card.querySelector(".save").onclick = async () => {

                try {

                    await guardar({

                        sourceId: n.sourceId,

                        item: item

                    });

                    alert("Noticia guardada correctamente.");

                }
                catch (error) {

                    alert("No fue posible guardar la noticia.");

                }
            };

        }

        contenedor.appendChild(card);



    });

}

document.getElementById("btnFuente").onclick = async () => {

    try {

        const fuente = {

            name: document.getElementById("sourceName").value,

            url: document.getElementById("sourceUrl").value,

            description: document.getElementById("sourceDescription").value,

            componentType: document.getElementById("componentType").value,

            requiresSecret: document.getElementById("requiresSecret").checked,

            secretKeyName: document.getElementById("secretKeyName").value

        };

        await crearFuente(fuente);

        alert("Fuente agregada correctamente.");

        document.getElementById("sourceName").value = "";
        document.getElementById("sourceUrl").value = "";
        document.getElementById("sourceDescription").value = "";
        document.getElementById("componentType").value = "";
        document.getElementById("requiresSecret").checked = false;
        document.getElementById("secretKeyName").value = "";

    }
    catch (error) {

        alert(error.message);

    }

};