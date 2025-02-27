document.addEventListener('DOMContentLoaded', cargarDatos);

let viajes = JSON.parse(localStorage.getItem('viajes')) || [];
let editing = false;
let viajeEditando = null;

document.getElementById('vehiculoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    if (editing) {
        guardarCambios();
    } else {
        agregarViaje();
    }
});

function agregarViaje() {
    const moneda = document.getElementById('moneda').value;
    const fecha = document.getElementById('fecha').value;
    const empresa = document.getElementById('empresa').value;
    const chofer = document.getElementById('chofer').value;
    const placa = document.getElementById('placa').value;
    const salida = document.getElementById('salida').value;
    const destino = document.getElementById('destino').value;
    const viaticos = parseFloat(document.getElementById('viaticos').value);
    const gasoil = parseFloat(document.getElementById('gasoil').value);
    const litrosGasoil = parseFloat(document.getElementById('litrosGasoil').value);
    const peaje = parseFloat(document.getElementById('peaje').value);
    const gastos = parseFloat(document.getElementById('gastos').value);
    const gastoExtra = parseFloat(document.getElementById('gastoExtra').value);
    const pago = parseFloat(document.getElementById('pago').value);
    const entrada = parseFloat(document.getElementById('entrada').value);
    const estadoPago = document.getElementById('estadoPago').value;

    const gananciasNetas = entrada - viaticos - gasoil - peaje - gastos - gastoExtra - pago;

    const nuevoViaje = {
        moneda: moneda,
        fecha: fecha,
        empresa: empresa,
        chofer: chofer,
        placa: placa,
        salida: salida,
        destino: destino,
        viaticos: viaticos,
        gasoil: gasoil,
        litrosGasoil: litrosGasoil,
        peaje: peaje,
        gastos: gastos,
        gastoExtra: gastoExtra,
        pago: pago,
        entrada: entrada,
        gananciasNetas: gananciasNetas,
        estadoPago: estadoPago
    };

    viajes.push(nuevoViaje);
    guardarDatos();
    mostrarReporte();
    document.getElementById('vehiculoForm').reset();
}

function editarViaje(index) {
    editing = true;
    viajeEditando = viajes[index];

    document.getElementById('moneda').value = viajeEditando.moneda;
    document.getElementById('fecha').value = viajeEditando.fecha;
    document.getElementById('empresa').value = viajeEditando.empresa;
    document.getElementById('chofer').value = viajeEditando.chofer;
    document.getElementById('placa').value = viajeEditando.placa;
    document.getElementById('salida').value = viajeEditando.salida;
    document.getElementById('destino').value = viajeEditando.destino;
    document.getElementById('viaticos').value = viajeEditando.viaticos;
    document.getElementById('gasoil').value = viajeEditando.gasoil;
    document.getElementById('litrosGasoil').value = viajeEditando.litrosGasoil;
    document.getElementById('peaje').value = viajeEditando.peaje;
    document.getElementById('gastos').value = viajeEditando.gastos;
    document.getElementById('gastoExtra').value = viajeEditando.gastoExtra;
    document.getElementById('pago').value = viajeEditando.pago;
    document.getElementById('entrada').value = viajeEditando.entrada;
    document.getElementById('estadoPago').value = viajeEditando.estadoPago;

    viajes.splice(index, 1);
    guardarDatos();
    mostrarReporte();

    document.getElementById('mensaje-edicion').style.display = 'block';
    document.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
}

function guardarCambios() {
    viajeEditando.moneda = document.getElementById('moneda').value;
    viajeEditando.fecha = document.getElementById('fecha').value;
    viajeEditando.empresa = document.getElementById('empresa').value;
    viajeEditando.chofer = document.getElementById('chofer').value;
    viajeEditando.placa = document.getElementById('placa').value;
    viajeEditando.salida = document.getElementById('salida').value;
    viajeEditando.destino = document.getElementById('destino').value;
    viajeEditando.viaticos = parseFloat(document.getElementById('viaticos').value);
    viajeEditando.gasoil = parseFloat(document.getElementById('gasoil').value);
    viajeEditando.litrosGasoil = parseFloat(document.getElementById('litrosGasoil').value);
    viajeEditando.peaje = parseFloat(document.getElementById('peaje').value);
    viajeEditando.gastos = parseFloat(document.getElementById('gastos').value);
    viajeEditando.gastoExtra = parseFloat(document.getElementById('gastoExtra').value);
    viajeEditando.pago = parseFloat(document.getElementById('pago').value);
    viajeEditando.entrada = parseFloat(document.getElementById('entrada').value);
    viajeEditando.estadoPago = document.getElementById('estadoPago').value;

    viajes.push(viajeEditando);
    guardarDatos();
    mostrarReporte();

    document.getElementById('vehiculoForm').reset();
    editing = false;
    viajeEditando = null;

    document.getElementById('mensaje-edicion').style.display = 'none';
    document.querySelector('button[type="submit"]').textContent = 'Agregar Viaje';
}

function eliminarViaje(index) {
    viajes.splice(index, 1);
    guardarDatos();
    mostrarReporte();
}

function mostrarReporte() {
    const reporteDiv = document.getElementById('reporte');
    reporteDiv.innerHTML = '';

    viajes.forEach((viaje, index) => {
        const viajeReporte = document.createElement('div');
        viajeReporte.innerHTML = `
            <h3>Viaje #${index + 1}</h3>
            <p><strong>Moneda:</strong> ${viaje.moneda}</p>
            <p><strong>Fecha:</strong> ${viaje.fecha}</p>
            <p><strong>Empresa:</strong> ${viaje.empresa}</p>
            <p><strong>Chofer:</strong> ${viaje.chofer}</p>
            <p><strong>Placa:</strong> ${viaje.placa}</p>
            <p><strong>Salida:</strong> ${viaje.salida}</p>
            <p><strong>Destino:</strong> ${viaje.destino}</p>
            <p><strong>Viáticos:</strong> ${viaje.viaticos} ${viaje.moneda}</p>
            <p><strong>Gasoil:</strong> ${viaje.gasoil} ${viaje.moneda}</p>
            <p><strong>Litros Consumidos de Gasoil:</strong> ${viaje.litrosGasoil}</p>
            <p><strong>Peaje:</strong> ${viaje.peaje} ${viaje.moneda}</p>
            <p><strong>Gastos Adicionales:</strong> ${viaje.gastos} ${viaje.moneda}</p>
            <p><strong>Gasto Extra:</strong> ${viaje.gastoExtra} ${viaje.moneda}</p>
            <p><strong>Pago al Chofer:</strong> ${viaje.pago} ${viaje.moneda}</p>
            <p><strong>Entrada por Realizar el Servicio:</strong> ${viaje.entrada} ${viaje.moneda}</p>
            <p><strong>Ganancias Netas:</strong> ${viaje.gananciasNetas} ${viaje.moneda}</p>
            <p class="${viaje.estadoPago === 'Falta por cobrar' ? 'falta-cobrar' : 'pagado'}"><strong>Estado de Pago:</strong> ${viaje.estadoPago}</p>
            <button onclick="editarViaje(${index})">Editar</button>
            <button onclick="eliminarViaje(${index})">Eliminar</button>
            <button onclick="copiarAlPortapapeles(${index})">Copiar Ficha</button>
            <hr>
        `;
        reporteDiv.appendChild(viajeReporte);
    });
}

function copiarAlPortapapeles(index) {
    const viaje = viajes[index];

    const contenido = `
        Ficha de Viaje #${index + 1}
        --------------------------
        Moneda: ${viaje.moneda}
        Fecha: ${viaje.fecha}
        Empresa: ${viaje.empresa}
        Chofer: ${viaje.chofer}
        Placa: ${viaje.placa}
        Salida: ${viaje.salida}
        Destino: ${viaje.destino}
        Viáticos: ${viaje.viaticos} ${viaje.moneda}
        Gasoil: ${viaje.gasoil} ${viaje.moneda}
        Litros de Gasoil: ${viaje.litrosGasoil}
        Peaje: ${viaje.peaje} ${viaje.moneda}
        Gastos Adicionales: ${viaje.gastos} ${viaje.moneda}
        Gasto Extra: ${viaje.gastoExtra} ${viaje.moneda}
        Pago al Chofer: ${viaje.pago} ${viaje.moneda}
        Entrada: ${viaje.entrada} ${viaje.moneda}
        Ganancias Netas: ${viaje.gananciasNetas} ${viaje.moneda}
        Estado de Pago: ${viaje.estadoPago}
    `;

    // Copiar al portapapeles
    navigator.clipboard.writeText(contenido)
        .then(() => {
            alert("La ficha se ha copiado al portapapeles. Puedes pegarla donde necesites.");
        })
        .catch((error) => {
            console.error("Error al copiar al portapapeles:", error);
            alert("Hubo un error al copiar la ficha. Intenta nuevamente.");
        });
}

function guardarDatos() {
    localStorage.setItem('viajes', JSON.stringify(viajes));
}

function cargarDatos() {
    mostrarReporte();
}
