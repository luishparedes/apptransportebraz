document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    let viajes = JSON.parse(localStorage.getItem('viajes')) || [];
    let editingIndex = null;
    let editing = false;
    
    // Inicializar
    init();
    
    function init() {
        cargarDatos();
        setupEventListeners();
        mostrarSeccion('reporte');
        actualizarResumenFinanciero();
    }
    
    function setupEventListeners() {
        // Menú móvil
        document.getElementById('menuToggle').addEventListener('click', toggleMenu);
        document.getElementById('closeMenu').addEventListener('click', toggleMenu);
        document.getElementById('menuOverlay').addEventListener('click', toggleMenu);
        
        // Navegación del menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                mostrarSeccion(section);
                toggleMenu();
                
                // Actualizar clase activa
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Formulario
        document.getElementById('vehiculoForm').addEventListener('submit', manejarSubmitForm);
        document.getElementById('cancelEdit').addEventListener('click', cancelarEdicion);
        
        // Filtros
        document.getElementById('filterMoneda').addEventListener('change', mostrarReporte);
        document.getElementById('filterEstado').addEventListener('change', mostrarReporte);
        
        // Botón flotante
        document.getElementById('fabAdd').addEventListener('click', () => {
            mostrarSeccion('formulario');
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelector('[data-section="formulario"]').classList.add('active');
        });
    }
    
    function toggleMenu() {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        menu.classList.toggle('active');
        overlay.style.display = menu.classList.contains('active') ? 'block' : 'none';
    }
    
    function mostrarSeccion(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar la sección seleccionada
        const seccion = document.getElementById(sectionId);
        seccion.classList.remove('hidden');
        
        // Actualizar contenido si es necesario
        if (sectionId === 'reporte') {
            mostrarReporte();
        } else if (sectionId === 'graficos') {
            actualizarGraficos();
        } else if (sectionId === 'resumen') {
            actualizarResumenFinanciero();
        }
    }
    
    function manejarSubmitForm(event) {
        event.preventDefault();
        
        if (editing) {
            guardarCambios();
        } else {
            agregarViaje();
        }
    }
    
    function agregarViaje() {
        const viaje = obtenerDatosFormulario();
        
        // Validar número de viaje único
        if (viajes.some(v => v.numeroViaje === viaje.numeroViaje)) {
            mostrarToast("El número de viaje ya existe", "error");
            return;
        }
        
        viajes.push(viaje);
        guardarDatos();
        mostrarToast("Viaje agregado exitosamente", "success");
        
        resetFormulario();
        mostrarSeccion('reporte');
    }
    
    function editarViaje(index) {
        editing = true;
        editingIndex = index;
        const viaje = viajes[index];
        
        // Cargar datos en el formulario
        Object.keys(viaje).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = viaje[key];
            }
        });
        
        // Actualizar interfaz
        document.getElementById('btnSubmitText').textContent = 'Guardar Cambios';
        document.getElementById('cancelEdit').style.display = 'block';
        
        // Ir al formulario
        mostrarSeccion('formulario');
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelector('[data-section="formulario"]').classList.add('active');
        
        mostrarToast("Modifica los campos necesarios", "info");
    }
    
    function guardarCambios() {
        if (editingIndex === null) return;
        
        const viajeActualizado = obtenerDatosFormulario();
        
        // CORRECCIÓN: Actualizar el viaje existente en lugar de crear copia
        viajes[editingIndex] = viajeActualizado;
        
        guardarDatos();
        mostrarToast("Cambios guardados correctamente", "success");
        
        resetFormulario();
        mostrarSeccion('reporte');
    }
    
    function cancelarEdicion() {
        resetFormulario();
        mostrarSeccion('reporte');
    }
    
    function resetFormulario() {
        document.getElementById('vehiculoForm').reset();
        document.getElementById('btnSubmitText').textContent = 'Agregar Viaje';
        document.getElementById('cancelEdit').style.display = 'none';
        editing = false;
        editingIndex = null;
    }
    
    function obtenerDatosFormulario() {
        const entrada = parseFloat(document.getElementById('entrada').value) || 0;
        const viaticos = parseFloat(document.getElementById('viaticos').value) || 0;
        const gasoil = parseFloat(document.getElementById('gasoil').value) || 0;
        const peaje = parseFloat(document.getElementById('peaje').value) || 0;
        const gastos = parseFloat(document.getElementById('gastos').value) || 0;
        const pago = parseFloat(document.getElementById('pago').value) || 0;
        
        // CORRECCIÓN MATEMÁTICA: Calcular ganancias correctamente
        const totalGastos = viaticos + gasoil + peaje + gastos + pago;
        const gananciasNetas = entrada - totalGastos;
        
        return {
            numeroViaje: document.getElementById('numeroViaje').value,
            moneda: document.getElementById('moneda').value,
            fecha: document.getElementById('fecha').value,
            empresa: document.getElementById('empresa').value,
            chofer: document.getElementById('chofer').value,
            placa: document.getElementById('placa').value,
            salida: document.getElementById('salida').value,
            destino: document.getElementById('destino').value,
            viaticos: viaticos,
            gasoil: gasoil,
            litrosGasoil: parseFloat(document.getElementById('litrosGasoil').value) || 0,
            peaje: peaje,
            gastos: gastos,
            pago: pago,
            entrada: entrada,
            gananciasNetas: gananciasNetas,
            estadoPago: document.getElementById('estadoPago').value,
            fechaCreacion: new Date().toISOString()
        };
    }
    
    function eliminarViaje(index) {
        if (confirm('¿Estás seguro de eliminar este viaje?')) {
            viajes.splice(index, 1);
            guardarDatos();
            mostrarReporte();
            mostrarToast("Viaje eliminado", "success");
        }
    }
    
    function mostrarReporte() {
        const container = document.getElementById('reporteContainer');
        if (!container) return;
        
        const monedaFiltro = document.getElementById('filterMoneda').value;
        const estadoFiltro = document.getElementById('filterEstado').value;
        
        // Filtrar viajes
        let viajesFiltrados = viajes;
        
        if (monedaFiltro !== 'todas') {
            viajesFiltrados = viajesFiltrados.filter(v => v.moneda === monedaFiltro);
        }
        
        if (estadoFiltro !== 'todos') {
            viajesFiltrados = viajesFiltrados.filter(v => v.estadoPago === estadoFiltro);
        }
        
        // Ordenar por fecha (más recientes primero)
        viajesFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        if (viajesFiltrados.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No hay viajes registrados</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = viajesFiltrados.map((viaje, index) => `
            <div class="viaje-card">
                <div class="viaje-header">
                    <div class="viaje-title">
                        Viaje #${viaje.numeroViaje} - ${viaje.empresa}
                    </div>
                    <div class="viaje-badges">
                        <span class="badge badge-moneda">${viaje.moneda}</span>
                        <span class="badge badge-estado ${viaje.estadoPago === 'Falta por cobrar' ? 'falta-cobrar' : ''}">
                            ${viaje.estadoPago}
                        </span>
                    </div>
                </div>
                
                <div class="viaje-details">
                    <div class="detail-item">
                        <span class="detail-label">Fecha</span>
                        <span class="detail-value">${viaje.fecha}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Chofer</span>
                        <span class="detail-value">${viaje.chofer}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ruta</span>
                        <span class="detail-value">${viaje.salida} → ${viaje.destino}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ingreso</span>
                        <span class="detail-value">${viaje.entrada.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                </div>
                
                <div class="viaje-details">
                    <div class="detail-item">
                        <span class="detail-label">Viáticos</span>
                        <span class="detail-value">${viaje.viaticos.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Gasoil</span>
                        <span class="detail-value">${viaje.gasoil.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Peaje</span>
                        <span class="detail-value">${viaje.peaje.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Gastos Adicionales</span>
                        <span class="detail-value">${viaje.gastos.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pago Chofer</span>
                        <span class="detail-value">${viaje.pago.toFixed(2)} ${viaje.moneda}</span>
                    </div>
                </div>
                
                <div class="viaje-details">
                    <div class="detail-item">
                        <span class="detail-label">Total Gastos</span>
                        <span class="detail-value">
                            ${(viaje.viaticos + viaje.gasoil + viaje.peaje + viaje.gastos + viaje.pago).toFixed(2)} ${viaje.moneda}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ganancia Neta</span>
                        <span class="detail-value ${viaje.gananciasNetas >= 0 ? 'pagado' : 'falta-cobrar'}">
                            ${viaje.gananciasNetas.toFixed(2)} ${viaje.moneda}
                        </span>
                    </div>
                </div>
                
                <div class="viaje-actions">
                    <button class="btn-action btn-edit" onclick="editarViaje(${viajes.indexOf(viaje)})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarViaje(${viajes.indexOf(viaje)})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn-action btn-copy" onclick="copiarAlPortapapeles(${viajes.indexOf(viaje)})">
                        <i class="fas fa-copy"></i> Copiar Ficha
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function copiarAlPortapapeles(index) {
        const viaje = viajes[index];
        
        const contenido = `Ficha de Viaje #${viaje.numeroViaje}
--------------------------
📅 Fecha: ${viaje.fecha}
🏢 Empresa: ${viaje.empresa}
👤 Chofer: ${viaje.chofer}
🚗 Placa: ${viaje.placa}
📍 Ruta: ${viaje.salida} → ${viaje.destino}

💰 INGRESOS:
• Entrada por servicio: ${viaje.entrada.toFixed(2)} ${viaje.moneda}

💸 GASTOS:
• Viáticos: ${viaje.viaticos.toFixed(2)} ${viaje.moneda}
• Gasoil: ${viaje.gasoil.toFixed(2)} ${viaje.moneda}
• Peaje: ${viaje.peaje.toFixed(2)} ${viaje.moneda}
• Gastos adicionales: ${viaje.gastos.toFixed(2)} ${viaje.moneda}
• Pago al chofer: ${viaje.pago.toFixed(2)} ${viaje.moneda}

📊 RESUMEN:
• Total gastos: ${(viaje.viaticos + viaje.gasoil + viaje.peaje + viaje.gastos + viaje.pago).toFixed(2)} ${viaje.moneda}
• Ganancia neta: ${viaje.gananciasNetas.toFixed(2)} ${viaje.moneda}

✅ Estado: ${viaje.estadoPago}`;

        navigator.clipboard.writeText(contenido)
            .then(() => mostrarToast("Ficha copiada al portapapeles", "success"))
            .catch(() => mostrarToast("Error al copiar", "error"));
    }
    
    function actualizarGraficos() {
        if (viajes.length === 0) {
            document.getElementById('graficos').innerHTML += `
                <div class="no-data">
                    <i class="fas fa-chart-bar"></i>
                    <p>No hay datos para mostrar gráficos</p>
                </div>
            `;
            return;
        }
        
        // Gráfico de ganancias por viaje
        const gananciasCtx = document.getElementById('gananciasChart').getContext('2d');
        new Chart(gananciasCtx, {
            type: 'bar',
            data: {
                labels: viajes.slice(-10).map(v => `Viaje #${v.numeroViaje}`),
                datasets: [{
                    label: 'Ganancias Netas',
                    data: viajes.slice(-10).map(v => v.gananciasNetas),
                    backgroundColor: viajes.slice(-10).map(v => 
                        v.gananciasNetas >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                    ),
                    borderColor: viajes.slice(-10).map(v => 
                        v.gananciasNetas >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
        
        // Gráfico de distribución de gastos
        const gastosCtx = document.getElementById('gastosChart').getContext('2d');
        const totalViaticos = viajes.reduce((sum, v) => sum + v.viaticos, 0);
        const totalGasoil = viajes.reduce((sum, v) => sum + v.gasoil, 0);
        const totalPeaje = viajes.reduce((sum, v) => sum + v.peaje, 0);
        const totalGastosAdd = viajes.reduce((sum, v) => sum + v.gastos, 0);
        const totalPago = viajes.reduce((sum, v) => sum + v.pago, 0);
        
        new Chart(gastosCtx, {
            type: 'pie',
            data: {
                labels: ['Viáticos', 'Gasoil', 'Peaje', 'Gastos Adicionales', 'Pago Chofer'],
                datasets: [{
                    data: [totalViaticos, totalGasoil, totalPeaje, totalGastosAdd, totalPago],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    function actualizarResumenFinanciero() {
        if (viajes.length === 0) return;
        
        // Separar por moneda
        const viajesUSD = viajes.filter(v => v.moneda === 'USD');
        const viajesBS = viajes.filter(v => v.moneda === 'BS');
        
        // Calcular para USD
        const totalIngresosUSD = viajesUSD.reduce((sum, v) => sum + v.entrada, 0);
        const totalGastosUSD = viajesUSD.reduce((sum, v) => sum + 
            v.viaticos + v.gasoil + v.peaje + v.gastos + v.pago, 0);
        const gananciaNetaUSD = totalIngresosUSD - totalGastosUSD;
        
        // Calcular para BS
        const totalIngresosBS = viajesBS.reduce((sum, v) => sum + v.entrada, 0);
        const totalGastosBS = viajesBS.reduce((sum, v) => sum + 
            v.viaticos + v.gasoil + v.peaje + v.gastos + v.pago, 0);
        const gananciaNetaBS = totalIngresosBS - totalGastosBS;
        
        // Actualizar UI
        document.getElementById('totalIngresosUSD').textContent = `$${totalIngresosUSD.toFixed(2)}`;
        document.getElementById('totalGastosUSD').textContent = `$${totalGastosUSD.toFixed(2)}`;
        document.getElementById('gananciaNetaUSD').textContent = `$${gananciaNetaUSD.toFixed(2)}`;
        
        document.getElementById('totalIngresosBS').textContent = `Bs ${totalIngresosBS.toFixed(2)}`;
        document.getElementById('totalGastosBS').textContent = `Bs ${totalGastosBS.toFixed(2)}`;
        document.getElementById('gananciaNetaBS').textContent = `Bs ${gananciaNetaBS.toFixed(2)}`;
        
        document.getElementById('totalViajes').textContent = viajes.length;
        document.getElementById('viajesActivos').textContent = viajes.filter(v => v.estadoPago === 'Falta por cobrar').length;
        
        const gananciaPromedio = viajes.length > 0 
            ? viajes.reduce((sum, v) => sum + v.gananciasNetas, 0) / viajes.length 
            : 0;
        document.getElementById('gananciaPromedio').textContent = `$${gananciaPromedio.toFixed(2)}`;
    }
    
    function mostrarToast(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = mensaje;
        toast.className = 'toast';
        toast.classList.add('show');
        
        // Color según tipo
        if (tipo === 'success') {
            toast.style.background = 'rgba(76, 175, 80, 0.9)';
        } else if (tipo === 'error') {
            toast.style.background = 'rgba(244, 67, 54, 0.9)';
        } else if (tipo === 'info') {
            toast.style.background = 'rgba(33, 150, 243, 0.9)';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    function guardarDatos() {
        localStorage.setItem('viajes', JSON.stringify(viajes));
        mostrarReporte();
        actualizarResumenFinanciero();
    }
    
    function cargarDatos() {
        mostrarReporte();
        actualizarGraficos();
    }
    
    // Hacer funciones disponibles globalmente
    window.editarViaje = editarViaje;
    window.eliminarViaje = eliminarViaje;
    window.copiarAlPortapapeles = copiarAlPortapapeles;
});
