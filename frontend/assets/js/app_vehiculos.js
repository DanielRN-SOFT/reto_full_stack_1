// DOM
const btnNuevo = document.querySelector("#btnNuevo");
const tblVehiculos = document.querySelector("#tblVehiculos");
const ulrApi = "http://localhost:3000/vehiculos/";
const modalVehiculos = new bootstrap.Modal("#modalVehiculos");
const frmVehiculos = document.querySelector("#frmVehiculos");
const capaReload = document.querySelector("#capaReload");
let contenidoBuscador = [];

// Campos
const txtCodigo = document.querySelector("#txtCodigo");
const txtDescripcion = document.querySelector("#txtDescripcion");
const txtMarca = document.querySelector("#txtMarca");
const txtModelo = document.querySelector("#txtModelo");
const txtPlaca = document.querySelector("#txtPlaca");
const txtAnotaciones = document.querySelector("#txtAnotaciones");

document.addEventListener("DOMContentLoaded", () => {
  consumirApi();
});

function llenarTabla(vehiculos) {
  vehiculos.forEach((vehiculo) => {
    let filaVeh = document.createElement("tr");

    let tdCodigo = document.createElement("td");
    tdCodigo.innerText = vehiculo.id;

    let tdDescripcion = document.createElement("td");
    tdDescripcion.innerText = vehiculo.descripcion;

    let tdMarca = document.createElement("td");
    tdMarca.innerText = vehiculo.marca;

    let tdModelo = document.createElement("td");
    tdModelo.innerText = vehiculo.modelo;

    let tdPlaca = document.createElement("td");
    tdPlaca.innerText = vehiculo.placa;

    let tdAnotaciones = document.createElement("td");
    tdAnotaciones.innerText = vehiculo.anotaciones;

    let tdEditar = document.createElement("td");
    let btnEditar = document.createElement("button");
    btnEditar.classList.add("btn", "btn-primary", "btn-sm", "btnEditar");
    btnEditar.setAttribute("id", "btnEditar");
    btnEditar.innerText = "Editar";
    tdEditar.appendChild(btnEditar);

    let tdEliminar = document.createElement("td");
    let btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn", "btn-danger", "btn-sm", "btnEliminar");
    btnEliminar.setAttribute("id", "btnEliminar");
    btnEliminar.innerText = "Eliminar";
    tdEliminar.appendChild(btnEliminar);

    filaVeh.appendChild(tdCodigo);
    filaVeh.appendChild(tdDescripcion);
    filaVeh.appendChild(tdMarca);
    filaVeh.appendChild(tdModelo);
    filaVeh.appendChild(tdPlaca);
    filaVeh.appendChild(tdAnotaciones);
    filaVeh.appendChild(tdEditar);
    filaVeh.appendChild(tdEliminar);

    tblVehiculos.appendChild(filaVeh);
  });
}

function consumirApi() {
  fetch(ulrApi)
    .then((res) => res.json())
    .then((vehiculos) => {
      llenarTabla(vehiculos);
    });
}

btnNuevo.addEventListener("click", () => {
  txtCodigo.value = "";
  txtDescripcion.value = "";
  txtMarca.value = "";
  txtModelo.value = "";
  txtPlaca.value = "";
  txtAnotaciones.value = "";
  modalVehiculos.show();
  frmVehiculos.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch(ulrApi, {
      method: "POST",
      header: { ContentType: "application-json" },
      body: JSON.stringify({
        codigo: txtCodigo.value,
        descripcion: txtDescripcion.value,
        marca: txtMarca.value,
        modelo: txtModelo.value,
        placa: txtPlaca.value,
        anotaciones: txtAnotaciones.value,
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res));

    modalVehiculos.hide();
    location.reload();
  });
});

tblVehiculos.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnEliminar")) {
    let fila = e.target.closest("tr");
    let codigo = fila.cells[0].innerText;
    let placa = fila.cells[4].innerText;
    Swal.fire({
      title: "Eliminar vehiculo",
      html: `¿Esta seguro de eliminar este vehiculo?
      <br> Placa: <strong> ${placa} </strong>`,
      icon: "warning",
      confirmButtonText: "Si, eliminar vehiculo",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-primary fw-bold rounded",
        cancelButton: "btn btn-danger fw-bold rounded",
      },
      preConfirm: () => {
        fetch(ulrApi + codigo, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((res) => console.log(res));
      },
    });
  }

  if (e.target.classList.contains("btnEditar")) {
    // Captura de los datos de la fila seleccionada
    const fila = e.target.closest("tr");
    const codigo = fila.cells[0].innerText;
    const descripcion = fila.cells[1].innerText;
    const marca = fila.cells[2].innerText;
    const modelo = fila.cells[3].innerText;
    const placa = fila.cells[4].innerText;
    const anotaciones = fila.cells[5].innerText;

    // Asignacion de valores a los inputs
    txtCodigo.value = codigo;
    txtDescripcion.value = descripcion;
    txtMarca.value = marca;
    txtModelo.value = modelo;
    txtPlaca.value = placa;
    txtAnotaciones.value = anotaciones;

    // Mostrar la modal
    modalVehiculos.show();

    // Desencadenar evento del formulario
    frmVehiculos.addEventListener("submit", (e) => {
      e.preventDefault();
      fetch(ulrApi + codigo, {
        method: "PUT",
        header: { ContentType: "application-json" },
        body: JSON.stringify({
          id: txtCodigo.value,
          descripcion: txtDescripcion.value,
          marca: txtMarca.value,
          modelo: txtModelo.value,
          placa: txtPlaca.value,
          anotaciones: txtAnotaciones.value,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          modalVehiculos.hide();
          location.reload();
        });
    });
  }
});

btnBuscar.addEventListener("click", (e) => {
  e.preventDefault();
  if (txtBuscar.value.length === 0) {
    Swal.fire({
      title: "Busqueda fallida",
      text: "No ingresaste ningun codigo, intentalo de nuevo..",
      icon: "error",
    }).then(() => {
      location.reload();
    });
    return;
  }
  tblVehiculos.innerHTML = "";
  let urlBuscador = ulrApi + txtBuscar.value;
  fetch(urlBuscador, {
    metodo: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        Swal.fire({
          title: "Sin resultados",
          text: "No se encontró ningun vehiculo con ese codigo...",
          icon: "error",
        }).then(() => {
          location.reload();
        });
        throw new Error("Error en la petición: " + response.status);
      }
      return response.json();
    })
    .then((response) => {
      contenidoBuscador = [];
      contenidoBuscador.push(response);
      llenarBuscador(contenidoBuscador);
    })
    .catch((error) => {
      console.error(error);
    });
});

const llenarBuscador = (objetoJSON) => {
  tblVehiculos.innerHTML = "";
  txtBuscar.value = "";
  llenarTabla(objetoJSON);
  let link = document.createElement("a");
  link.href = "index.html";
  link.innerText = "Volver al listado";
  capaReload.appendChild(link);
};
