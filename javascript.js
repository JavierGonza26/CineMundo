
const API_KEY = "23d293f68f8572d3014d602abe500135";

const URL_BASE = "https://api.themoviedb.org/3";
const URL_IMAGENES = "https://image.tmdb.org/t/p/w500";

const resultados = document.getElementById("resultados");
const estado = document.getElementById("estado");
const busqueda = document.getElementById("busqueda");
const formulario = document.getElementById("formulario-busqueda");
const tituloCatalogo = document.getElementById("titulo-catalogo");
const botonesFiltro = document.querySelectorAll(".filtro");

let tipoActual = "movie";

async function consultarAPI(url) {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los datos de TMDB.");
    }

    return await respuesta.json();
}

function mostrarContenido(lista) {
    resultados.replaceChildren();

    if (!lista || lista.length === 0) {
        estado.textContent = "No se encontraron resultados.";
        return;
    }

    estado.textContent = `Se encontraron ${lista.length} resultados.`;

    lista.forEach(item => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const imagen = document.createElement("img");
        imagen.alt = `Póster de ${item.title || item.name}`;
        imagen.loading = "lazy";

        if (item.poster_path) {
            imagen.src = URL_IMAGENES + item.poster_path;
        } else {
            imagen.alt = "Póster no disponible";
            imagen.src = "https://placehold.co/500x750/292938/ffffff?text=Sin+poster";
        }

        const informacion = document.createElement("div");
        informacion.className = "info-tarjeta";

        const titulo = document.createElement("h3");
        titulo.textContent = item.title || item.name || "Sin título";

        const fecha = document.createElement("p");
        fecha.className = "fecha";

        const fechaOriginal = item.release_date || item.first_air_date;
        fecha.textContent = fechaOriginal
            ? `Estreno: ${fechaOriginal}`
            : "Fecha no disponible";

        const calificacion = document.createElement("p");
        calificacion.className = "calificacion";
        calificacion.textContent =
            `★ ${Number(item.vote_average || 0).toFixed(1)} / 10`;

        informacion.append(titulo, fecha, calificacion);
        tarjeta.append(imagen, informacion);
        resultados.appendChild(tarjeta);
    });
}

async function cargarPopulares() {
    const nombreTipo = tipoActual === "movie" ? "Películas" : "Series";

    tituloCatalogo.textContent = `${nombreTipo} populares`;
    estado.textContent = "Cargando catálogo...";
    resultados.replaceChildren();

    const url = `${URL_BASE}/${tipoActual}/popular?api_key=${API_KEY}&language=es-ES&page=1`;

    try {
        const datos = await consultarAPI(url);
        mostrarContenido(datos.results);
    } catch (error) {
        estado.textContent =
            "No se pudo cargar el catálogo. Revisa tu clave y tu conexión.";
        console.error(error);
    }
}

async function buscarContenido(texto) {
    const consulta = texto.trim();

    if (!consulta) {
        cargarPopulares();
        return;
    }

    const nombreTipo = tipoActual === "movie" ? "películas" : "series";

    tituloCatalogo.textContent =
        `Resultados para: ${consulta}`;

    estado.textContent = "Buscando...";
    resultados.replaceChildren();

    const url = `${URL_BASE}/search/${tipoActual}?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(consulta)}&page=1`;

    try {
        const datos = await consultarAPI(url);
        mostrarContenido(datos.results);
    } catch (error) {
        estado.textContent =
            `No fue posible buscar ${nombreTipo}. Comprueba la conexión y tu clave API.`;
        console.error(error);
    }
}

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();
    buscarContenido(busqueda.value);
});

botonesFiltro.forEach(boton => {
    boton.addEventListener("click", function() {
        tipoActual = boton.dataset.tipo;

        botonesFiltro.forEach(b => b.classList.remove("activo"));
        boton.classList.add("activo");

        busqueda.value = "";
        cargarPopulares();
    });
});

cargarPopulares();
