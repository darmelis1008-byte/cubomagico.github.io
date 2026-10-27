const formulario = document.getElementById("formulario");
const nombreInput = document.getElementById("nombre");
const aristaInput = document.getElementById("arista");
const unidadInput = document.getElementById("unidad");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaEjercicios");

let ejercicios = [];
let seleccionadoId = null;
let siguienteId = 1;
let ultimoCalculo = null;

function calcularArea(arista) {
  return 6 * arista * arista;
}

function formatoNumero(numero) {
  return Number(numero.toFixed(4)).toString();
}

function calcularYMostrar() {
  const arista = Number(aristaInput.value);
  const unidad = unidadInput.value;

  if (!Number.isFinite(arista) || arista <= 0) {
    mensaje.textContent = "Ingresa una medida mayor que cero.";
    aristaInput.focus();
    return null;
  }

  const cuadrado = arista * arista;
  const area = calcularArea(arista);
  ultimoCalculo = { arista, unidad, cuadrado, area };

  document.getElementById("medidaVista").textContent = `l = ${formatoNumero(arista)} ${unidad}`;
  document.getElementById("paso1").textContent = `1. ${formatoNumero(arista)}² = ${formatoNumero(cuadrado)}`;
  document.getElementById("paso2").textContent = `2. 6 × ${formatoNumero(cuadrado)} = ${formatoNumero(area)}`;
  document.getElementById("areaTotal").textContent = `${formatoNumero(area)} ${unidad}²`;
  mensaje.textContent = "Cálculo realizado correctamente.";
  return ultimoCalculo;
}

document.getElementById("calcular").addEventListener("click", calcularYMostrar);

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = nombreInput.value.trim();
  const resultado = calcularYMostrar();

  if (!nombre) {
    mensaje.textContent = "Escribe el nombre del ejercicio antes de guardar.";
    nombreInput.focus();
    return;
  }
  if (!resultado) return;

  // Evita guardar dos ejercicios con el mismo nombre (sin distinguir mayúsculas).
  const nombreDuplicado = ejercicios.some(e =>
    e.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase() && e.id !== seleccionadoId
  );
  if (nombreDuplicado) {
    mensaje.textContent = "Ya existe un ejercicio con ese nombre. Usa otro nombre.";
    nombreInput.focus();
    return;
  }

  if (seleccionadoId !== null) {
    const indice = ejercicios.findIndex(e => e.id === seleccionadoId);
    if (indice !== -1) {
      ejercicios[indice] = { id: seleccionadoId, nombre, ...resultado };
      mensaje.textContent = "Ejercicio modificado correctamente.";
    }
    seleccionadoId = null;
  } else {
    ejercicios.push({ id: siguienteId++, nombre, ...resultado });
    mensaje.textContent = "Ejercicio guardado correctamente.";
  }

  guardarEnNavegador();
  renderizarLista();
  formulario.reset();
  aristaInput.value = "4";
  unidadInput.value = "cm";
  calcularYMostrar();
});

function renderizarLista() {
  lista.innerHTML = "";
  if (ejercicios.length === 0) {
    lista.innerHTML = '<tr class="vacio"><td colspan="5">Aún no hay ejercicios guardados.</td></tr>';
    return;
  }

  ejercicios.forEach((ejercicio, indice) => {
    const fila = document.createElement("tr");
    const valores = [
      indice + 1,
      ejercicio.nombre,
      `${formatoNumero(ejercicio.arista)} ${ejercicio.unidad}`,
      `${formatoNumero(ejercicio.area)} ${ejercicio.unidad}²`
    ];

    valores.forEach(valor => {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    });

    const acciones = document.createElement("td");
    const editar = document.createElement("button");
    editar.className = "mini-btn editar";
    editar.type = "button";
    editar.textContent = "✎";
    editar.title = `Modificar ${ejercicio.nombre}`;
    editar.setAttribute("aria-label", `Modificar ${ejercicio.nombre}`);
    editar.addEventListener("click", () => cargarParaEditar(ejercicio.id));

    const borrar = document.createElement("button");
    borrar.className = "mini-btn borrar";
    borrar.type = "button";
    borrar.textContent = "▤";
    borrar.title = `Eliminar ${ejercicio.nombre}`;
    borrar.setAttribute("aria-label", `Eliminar ${ejercicio.nombre}`);
    borrar.addEventListener("click", () => eliminarEjercicio(ejercicio.id));

    acciones.append(editar, borrar);
    fila.appendChild(acciones);
    if (ejercicio.id === seleccionadoId) fila.classList.add("seleccionado");
    lista.appendChild(fila);
  });
}

function cargarParaEditar(id) {
  const ejercicio = ejercicios.find(e => e.id === id);
  if (!ejercicio) return;
  seleccionadoId = id;
  nombreInput.value = ejercicio.nombre;
  aristaInput.value = ejercicio.arista;
  unidadInput.value = ejercicio.unidad;
  calcularYMostrar();
  mensaje.textContent = "Edita los datos y pulsa Guardar para confirmar los cambios.";
  nombreInput.focus();
  renderizarLista();
}

function eliminarEjercicio(id) {
  const ejercicio = ejercicios.find(e => e.id === id);
  if (!ejercicio) return;
  if (!confirm(`¿Deseas eliminar el ejercicio "${ejercicio.nombre}"?`)) return;
  ejercicios = ejercicios.filter(e => e.id !== id);
  if (seleccionadoId === id) {
    seleccionadoId = null;
    formulario.reset();
    aristaInput.value = "4";
    unidadInput.value = "cm";
  }
  guardarEnNavegador();
  renderizarLista();
  mensaje.textContent = "Ejercicio eliminado.";
}

document.getElementById("nuevo").addEventListener("click", () => {
  seleccionadoId = null;
  formulario.reset();
  aristaInput.value = "4";
  unidadInput.value = "cm";
  nombreInput.focus();
  calcularYMostrar();
  mensaje.textContent = "Completa el formulario para agregar un ejercicio nuevo.";
  renderizarLista();
});

document.getElementById("modificarSeleccionado").addEventListener("click", () => {
  if (seleccionadoId === null) {
    mensaje.textContent = "Selecciona un ejercicio con el botón ✎ de la tabla para modificarlo.";
    return;
  }
  nombreInput.focus();
  mensaje.textContent = "Realiza los cambios y pulsa Guardar.";
});

document.getElementById("eliminarSeleccionado").addEventListener("click", () => {
  if (seleccionadoId === null) {
    mensaje.textContent = "Selecciona un ejercicio de la tabla antes de eliminarlo.";
    return;
  }
  eliminarEjercicio(seleccionadoId);
});

document.getElementById("consultar").addEventListener("click", () => {
  renderizarLista();
  document.querySelector(".lista-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  mensaje.textContent = `Consulta actualizada: ${ejercicios.length} ejercicio(s) guardado(s).`;
});

formulario.addEventListener("reset", () => {
  seleccionadoId = null;
  setTimeout(() => {
    aristaInput.value = "4";
    unidadInput.value = "cm";
    calcularYMostrar();
  }, 0);
});

function guardarEnNavegador() {
  try {
    localStorage.setItem("cubomatic-ejercicios", JSON.stringify(ejercicios));
  } catch (error) {
    mensaje.textContent = "Los ejercicios funcionan, pero el navegador no permitió guardarlos para la próxima visita.";
  }
}

function cargarDelNavegador() {
  try {
    const datos = JSON.parse(localStorage.getItem("cubomatic-ejercicios") || "[]");
    if (Array.isArray(datos)) {
      ejercicios = datos.filter(e =>
        e && Number.isFinite(e.id) && typeof e.nombre === "string" &&
        Number.isFinite(e.arista) && Number.isFinite(e.area) &&
        ["mm", "cm", "m"].includes(e.unidad)
      );
      siguienteId = ejercicios.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    }
  } catch (error) {
    ejercicios = [];
  }
}

cargarDelNavegador();
renderizarLista();
calcularYMostrar();
