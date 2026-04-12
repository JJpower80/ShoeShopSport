// Array para almacenar productos del carrito (se sincronizará con PHP)
let carrito = [];
let usuarioActual = null;

// Cargar productos desde la base de datos al inicio
async function cargarProductosDesdeDB() {
    const response = await API.productos.obtenerTodos();
    if (response.success && response.data.length > 0) {
        renderizarProductos(response.data);
    }
}

// Renderizar productos en el DOM
function renderizarProductos(productos) {
    const productosGrid = document.querySelector('.productos-grid');
    if (!productosGrid) return;

    productosGrid.innerHTML = productos.map(producto => `
        <div class="producto-card">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p class="precio">${parseFloat(producto.precio).toFixed(2)}€</p>
            <button class="btn-carrito" onclick="agregarAlCarrito('${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio})">
                Añadir al carrito
            </button>
        </div>
    `).join('');
}

// Verificar sesión del usuario al cargar
async function verificarSesion() {
    const response = await API.auth.perfil();
    if (response.success && response.usuario) {
        usuarioActual = response.usuario;
        actualizarUIUsuario();
    }
}

// Actualizar UI según usuario logueado
function actualizarUIUsuario() {
    const btnLoginNav = document.getElementById('btnLoginNav');
    const usuarioInfo = document.getElementById('usuarioInfo');
    const nombreUsuario = document.getElementById('nombreUsuario');
    const adminPanel = document.getElementById('adminPanel');
    
    if (usuarioActual) {
        btnLoginNav.style.display = 'none';
        usuarioInfo.style.display = 'flex';
        nombreUsuario.textContent = `Hola, ${usuarioActual.nombre}`;
        
        // Si es admin, agregar botón de administración
        if (usuarioActual.rol === 'admin') {
            const existeBtnAdmin = document.getElementById('btnAbrirAdmin');
            if (!existeBtnAdmin) {
                const btnAdmin = document.createElement('button');
                btnAdmin.id = 'btnAbrirAdmin';
                btnAdmin.className = 'btn-logout';
                btnAdmin.textContent = 'Panel Admin';
                btnAdmin.style.backgroundColor = '#4caf50';
                btnAdmin.onclick = () => {
                    adminPanel.classList.add('active');
                    cargarProductosAdmin();
                };
                usuarioInfo.insertBefore(btnAdmin, usuarioInfo.lastElementChild);
            }
        }
    } else {
        btnLoginNav.style.display = 'inline';
        usuarioInfo.style.display = 'none';
        const btnAdmin = document.getElementById('btnAbrirAdmin');
        if (btnAdmin) btnAdmin.remove();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const btnCarrito = document.getElementById('btnCarrito');
    const carritoDropdown = document.getElementById('carritoDropdown');
    const btnCerrarCarrito = document.getElementById('btnCerrarCarrito');
    const btnVaciar = document.getElementById('btnVaciar');
    
    // Auth modals
    const modalAuth = document.getElementById('modalAuth');
    const btnLoginNav = document.getElementById('btnLoginNav');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const btnMostrarRegistro = document.getElementById('btnMostrarRegistro');
    const btnMostrarLogin = document.getElementById('btnMostrarLogin');
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formRegistro');
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');
    const btnLogout = document.getElementById('btnLogout');
    
    // Admin panel
    const adminPanel = document.getElementById('adminPanel');
    const btnCerrarAdmin = document.getElementById('btnCerrarAdmin');
    const adminProductoForm = document.getElementById('adminProductoForm');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

    // Chatbot local
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const chatbotCerrar = document.getElementById('chatbotCerrar');
    const chatbotMensajes = document.getElementById('chatbotMensajes');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotChips = document.querySelectorAll('.chatbot-chip');
    const CHATBOT_STORAGE_KEY = 'shoeshopsport_chat_historial';

    const faqRespuestas = [
        {
            keys: ['envio', 'enviar', 'entrega', 'cuanto tarda', 'tarda'],
            answer: 'Realizamos envios en 24-72 horas laborables dentro de la peninsula. Para pedidos superiores a 50EUR, el envio es gratis.'
        },
        {
            keys: ['devolucion', 'devolver', 'cambio', 'reembolso'],
            answer: 'Puedes solicitar devolucion dentro de los 14 dias naturales desde la entrega. El producto debe estar sin uso y en su caja original.'
        },
        {
            keys: ['talla', 'tallas', 'numero', 'guia'],
            answer: 'Recomendamos elegir tu talla habitual. Si dudas entre dos tallas, elige la mayor para running y la mas ajustada para uso casual.'
        },
        {
            keys: ['pago', 'tarjeta', 'pasarela', 'bizum'],
            answer: 'Aceptamos pago con tarjeta en la pasarela virtual del proyecto. Para pruebas: 4242 4242 4242 4242 aprueba y 4000 0000 0000 0002 rechaza.'
        },
        {
            keys: ['pedido', 'estado', 'seguimiento'],
            answer: 'El estado del pedido se registra al finalizar el pago. Si necesitas revisar uno, escribenos desde el formulario de contacto con tu email.'
        },
        {
            keys: ['contacto', 'telefono', 'correo', 'email'],
            answer: 'Puedes contactarnos desde la seccion Contacto o por email a info@shoeshopsport.com. Horario: L-V 9:00-20:00, Sabados 10:00-14:00.'
        },
        {
            keys: ['hola', 'buenas', 'hello'],
            answer: 'Hola, soy tu asistente virtual. Puedo ayudarte con envios, devoluciones, tallas, pagos o contacto.'
        }
    ];

    function chatbotGuardarHistorial() {
        if (!chatbotMensajes) return;
        const historial = Array.from(chatbotMensajes.querySelectorAll('.chatbot-msg')).map(msg => ({
            tipo: msg.classList.contains('user') ? 'user' : 'bot',
            texto: msg.textContent
        }));
        localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(historial));
    }

    function chatbotCargarHistorial() {
        if (!chatbotMensajes) return false;
        const raw = localStorage.getItem(CHATBOT_STORAGE_KEY);
        if (!raw) return false;

        try {
            const historial = JSON.parse(raw);
            if (!Array.isArray(historial) || !historial.length) return false;

            historial.forEach(item => {
                const tipo = item?.tipo === 'user' ? 'user' : 'bot';
                const texto = String(item?.texto || '').trim();
                if (!texto) return;
                chatbotAnadirMensaje(texto, tipo, false);
            });

            return chatbotMensajes.children.length > 0;
        } catch {
            return false;
        }
    }

    function chatbotAnadirMensaje(texto, tipo, guardar = true) {
        if (!chatbotMensajes) return;
        const msg = document.createElement('div');
        msg.className = `chatbot-msg ${tipo}`;
        msg.textContent = texto;
        chatbotMensajes.appendChild(msg);
        chatbotMensajes.scrollTop = chatbotMensajes.scrollHeight;
        if (guardar) chatbotGuardarHistorial();
    }

    function chatbotResponder(preguntaOriginal) {
        const pregunta = (preguntaOriginal || '').toLowerCase().trim();

        if (!pregunta) {
            return 'Puedes escribirme una duda concreta. Por ejemplo: envio, devolucion, tallas o pago.';
        }

        if (pregunta.includes('carrito') || pregunta.includes('total') || pregunta.includes('cuanto llevo')) {
            const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            const totalPrecio = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

            if (!totalItems) {
                return 'Tu carrito esta vacio ahora mismo. Puedes agregar productos desde la seccion Productos.';
            }

            return `Tienes ${totalItems} producto(s) en el carrito con un total de ${totalPrecio.toFixed(2)}EUR.`;
        }

        if (pregunta.includes('sesion') || pregunta.includes('mi cuenta') || pregunta.includes('usuario')) {
            if (usuarioActual) {
                return `Estas con sesion iniciada como ${usuarioActual.nombre}. Si quieres, puedo ayudarte a ir al carrito o a contacto.`;
            }
            return 'Ahora mismo no hay sesion iniciada. Puedes usar el boton "Iniciar Sesion" del menu.';
        }

        if (pregunta.includes('borrar chat') || pregunta.includes('limpiar chat') || pregunta.includes('reiniciar chat')) {
            chatbotMensajes.innerHTML = '';
            localStorage.removeItem(CHATBOT_STORAGE_KEY);
            return 'Historial del chat reiniciado. Empezamos de nuevo cuando quieras.';
        }

        for (const faq of faqRespuestas) {
            if (faq.keys.some(k => pregunta.includes(k))) {
                return faq.answer;
            }
        }

        if (pregunta.includes('producto') || pregunta.includes('zapatilla')) {
            document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' });
            return 'Te llevo a la seccion de productos para que veas el catalogo disponible.';
        }

        if (pregunta.includes('contactar') || pregunta.includes('mensaje')) {
            document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
            return 'Te llevo a contacto para que puedas enviarnos tu consulta.';
        }

        return 'No tengo una respuesta exacta para eso todavia. Prueba con: envio, devolucion, tallas, pago o contacto.';
    }

    function chatbotEnviar(texto) {
        chatbotAnadirMensaje(texto, 'user');
        const respuesta = chatbotResponder(texto);
        setTimeout(() => chatbotAnadirMensaje(respuesta, 'bot'), 250);
    }

    // Toggle del menú hamburguesa
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Chatbot eventos
    if (chatbotToggle && chatbotPanel && chatbotCerrar && chatbotForm && chatbotInput) {
        const tieneHistorial = chatbotCargarHistorial();
        if (!tieneHistorial) {
            chatbotAnadirMensaje('Hola, soy el asistente de ShoeShopSport. En que puedo ayudarte?', 'bot');
        }

        chatbotToggle.addEventListener('click', function() {
            chatbotPanel.classList.toggle('activo');
            if (chatbotPanel.classList.contains('activo')) {
                chatbotInput.focus();
            }
        });

        chatbotCerrar.addEventListener('click', function() {
            chatbotPanel.classList.remove('activo');
        });

        chatbotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const texto = chatbotInput.value.trim();
            if (!texto) return;
            chatbotEnviar(texto);
            chatbotInput.value = '';
        });

        chatbotChips.forEach(chip => {
            chip.addEventListener('click', function() {
                chatbotEnviar(this.dataset.prompt || this.textContent || '');
            });
        });
    }

    // Cerrar menú al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Cerrar menú al hacer resize en desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Toggle del carrito
    btnCarrito.addEventListener('click', function() {
        carritoDropdown.classList.toggle('active');
    });

    // Cerrar carrito
    btnCerrarCarrito.addEventListener('click', function() {
        carritoDropdown.classList.remove('active');
    });

    // Vaciar carrito
    btnVaciar.addEventListener('click', async function() {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            const response = await API.carrito.vaciar();
            if (response.success) {
                carrito = [];
                localStorage.removeItem('carrito');
                actualizarCarrito();
                carritoDropdown.classList.remove('active');
            }
        }
    });

    // Cerrar carrito al hacer click fuera
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.carrito-container')) {
            carritoDropdown.classList.remove('active');
        }
    });
    
    // Botón de finalizar compra → abre la pasarela virtual
    const btnComprar = document.querySelector('.btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', function() {
            if (carrito.length === 0) {
                mostrarNotificacion('El carrito está vacío');
                return;
            }
            abrirPasarelaPago();
        });
    }

    // ── Pasarela de pago virtual ──────────────────────────────────────────
    const modalPago     = document.getElementById('modalPago');
    const btnCerrarPago = document.getElementById('btnCerrarPago');

    function abrirPasarelaPago() {
        // Pre-rellenar datos de envío si hay usuario logueado
        if (usuarioActual) {
            document.getElementById('pagoNombre').value    = usuarioActual.nombre    || '';
            document.getElementById('pagoEmail').value     = usuarioActual.email     || '';
            document.getElementById('pagoTelefono').value  = usuarioActual.telefono  || '';
            document.getElementById('pagoDireccion').value = usuarioActual.direccion || '';
        } else {
            document.getElementById('pagoNombre').value    = '';
            document.getElementById('pagoEmail').value     = '';
            document.getElementById('pagoTelefono').value  = '';
            document.getElementById('pagoDireccion').value = '';
        }

        // Mostrar resumen del carrito
        const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
        const resumenHtml = `
            <h4>Resumen del pedido</h4>
            <ul class="pago-lista-productos">
                ${carrito.map(i => `<li><span>${i.nombre} × ${i.cantidad}</span><span>${(i.precio * i.cantidad).toFixed(2)}€</span></li>`).join('')}
            </ul>
            <div class="pago-total-resumen"><strong>Total:</strong> <strong>${total.toFixed(2)}€</strong></div>
        `;
        document.getElementById('pagoResumen').innerHTML = resumenHtml;
        document.getElementById('pagoTotalBtn').textContent = total.toFixed(2) + '€';

        irAPasoUI(1);
        modalPago.classList.add('active');
        carritoDropdown.classList.remove('active');
    }

    function irAPasoUI(paso) {
        [1, 2, 3, 4].forEach(n => {
            const el = document.getElementById('pagoStep' + n);
            if (el) el.style.display = (n === paso) ? 'block' : 'none';
        });
        [1, 2, 3].forEach(n => {
            const ind = document.getElementById('pasoInd' + n);
            if (ind) ind.classList.toggle('activo', n <= paso && paso < 3);
            if (ind) ind.classList.toggle('completado', n < paso);
        });
    }

    btnCerrarPago.addEventListener('click', () => modalPago.classList.remove('active'));
    modalPago.addEventListener('click', e => { if (e.target === modalPago) modalPago.classList.remove('active'); });

    // Paso 1 → Paso 2
    document.getElementById('formDatosEnvio').addEventListener('submit', function(e) {
        e.preventDefault();
        irAPasoUI(2);
    });

    document.getElementById('btnVolverEnvio').addEventListener('click', () => irAPasoUI(1));

    // Formatear número de tarjeta en tiempo real
    document.getElementById('cardNumero').addEventListener('input', function() {
        let v = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = v.replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('tvNumero').textContent =
            (v + '················').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
            .replace(/[^• ]/g, d => d === '·' ? '•' : d);
        // Mostrar dígitos reales en la tarjeta visual
        const display = v.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('tvNumero').textContent = display;
    });

    document.getElementById('cardTitular').addEventListener('input', function() {
        document.getElementById('tvTitular').textContent = this.value.toUpperCase() || 'NOMBRE APELLIDO';
    });

    document.getElementById('cardCaducidad').addEventListener('input', function() {
        let v = this.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        this.value = v;
        document.getElementById('tvCaducidad').textContent = v || 'MM/AA';
    });

    // Paso 2 → Procesar pago
    document.getElementById('formTarjeta').addEventListener('submit', async function(e) {
        e.preventDefault();

        const datosCliente = {
            nombre:    document.getElementById('pagoNombre').value,
            email:     document.getElementById('pagoEmail').value,
            telefono:  document.getElementById('pagoTelefono').value,
            direccion: document.getElementById('pagoDireccion').value
        };

        const datosTarjeta = {
            numero_tarjeta: document.getElementById('cardNumero').value,
            titular:        document.getElementById('cardTitular').value,
            caducidad:      document.getElementById('cardCaducidad').value,
            cvv:            document.getElementById('cardCvv').value
        };

        // Mostrar pantalla de procesando
        irAPasoUI(3);

        // Simular un pequeño delay para que parezca real
        await new Promise(r => setTimeout(r, 2000));

        const response = await API.pago.procesar({
            ...datosTarjeta,
            cliente:   datosCliente,
            productos: carrito
        });

        // Mostrar resultado
        irAPasoUI(4);
        const resultadoEl = document.getElementById('pagoResultado');

        if (response.success) {
            resultadoEl.innerHTML = `
                <div class="resultado-exito">
                    <div class="resultado-icono">✓</div>
                    <h2>¡Pago realizado con éxito!</h2>
                    <p>Pedido <strong>#${response.pedido_id}</strong> confirmado.</p>
                    <p>Total cobrado: <strong>${response.total.toFixed(2)}€</strong></p>
                    <p class="codigo-auth">Código de autorización: <strong>${response.codigo_autorizacion}</strong></p>
                    <button class="btn-primary" id="btnCerrarExito">Cerrar</button>
                </div>
            `;
            carrito = [];
            localStorage.removeItem('carrito');
            actualizarCarrito();
            document.getElementById('btnCerrarExito').addEventListener('click', () => {
                modalPago.classList.remove('active');
                document.getElementById('formTarjeta').reset();
                document.getElementById('tvNumero').textContent = '•••• •••• •••• ••••';
                document.getElementById('tvTitular').textContent = 'NOMBRE APELLIDO';
                document.getElementById('tvCaducidad').textContent = 'MM/AA';
            });
        } else {
            resultadoEl.innerHTML = `
                <div class="resultado-error">
                    <div class="resultado-icono">✗</div>
                    <h2>Pago rechazado</h2>
                    <p>${response.message || 'No se pudo procesar el pago.'}</p>
                    <button class="btn-primary" id="btnReintentar">Intentar de nuevo</button>
                </div>
            `;
            document.getElementById('btnReintentar').addEventListener('click', () => irAPasoUI(2));
        }
    });
    // ─────────────────────────────────────────────────────────────────────

    // Modal de Auth
    btnLoginNav.addEventListener('click', function(e) {
        e.preventDefault();
        modalAuth.classList.add('active');
        formLogin.style.display = 'block';
        formRegistro.style.display = 'none';
    });
    
    btnCerrarModal.addEventListener('click', function() {
        modalAuth.classList.remove('active');
    });
    
    modalAuth.addEventListener('click', function(e) {
        if (e.target === modalAuth) {
            modalAuth.classList.remove('active');
        }
    });
    
    btnMostrarRegistro.addEventListener('click', function(e) {
        e.preventDefault();
        formLogin.style.display = 'none';
        formRegistro.style.display = 'block';
    });
    
    btnMostrarLogin.addEventListener('click', function(e) {
        e.preventDefault();
        formRegistro.style.display = 'none';
        formLogin.style.display = 'block';
    });
    
    // Login form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const response = await API.auth.login({ email, password });
        
        if (response.success) {
            usuarioActual = response.usuario;
            modalAuth.classList.remove('active');
            loginForm.reset();
            actualizarUIUsuario();
            mostrarNotificacion(`Bienvenido, ${usuarioActual.nombre}`);
        } else {
            mostrarNotificacion('Error: ' + response.message);
        }
    });
    
    // Registro form
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datos = {
            nombre: document.getElementById('regNombre').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            telefono: document.getElementById('regTelefono').value,
            direccion: document.getElementById('regDireccion').value
        };
        
        const response = await API.auth.registro(datos);
        
        if (response.success) {
            usuarioActual = response.usuario;
            modalAuth.classList.remove('active');
            registroForm.reset();
            actualizarUIUsuario();
            mostrarNotificacion('Registro exitoso. ¡Bienvenido!');
        } else {
            mostrarNotificacion('Error: ' + response.message);
        }
    });
    
    // Logout
    btnLogout.addEventListener('click', async function() {
        const response = await API.auth.logout();
        if (response.success) {
            usuarioActual = null;
            actualizarUIUsuario();
            mostrarNotificacion('Sesión cerrada');
            
            // Cerrar panel admin si estaba abierto
            adminPanel.classList.remove('active');
        }
    });
    
    // Admin panel
    btnCerrarAdmin.addEventListener('click', function() {
        adminPanel.classList.remove('active');
    });
    
    btnCancelarEdicion.addEventListener('click', function() {
        adminProductoForm.reset();
        document.getElementById('adminProductoId').value = '';
    });
    
    adminProductoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('adminProductoId').value;
        const datos = {
            nombre: document.getElementById('adminNombre').value,
            descripcion: document.getElementById('adminDescripcion').value,
            precio: parseFloat(document.getElementById('adminPrecio').value),
            imagen: document.getElementById('adminImagen').value,
            stock: parseInt(document.getElementById('adminStock').value)
        };
        
        let response;
        if (id) {
            // Actualizar
            datos.id = id;
            response = await API.productos.actualizar(datos);
        } else {
            // Crear
            response = await API.productos.crear(datos);
        }
        
        if (response.success) {
            mostrarNotificacion(response.message);
            adminProductoForm.reset();
            document.getElementById('adminProductoId').value = '';
            cargarProductosAdmin();
            cargarProductosDesdeDB(); // Actualizar grid principal
        } else {
            mostrarNotificacion('Error: ' + response.message);
        }
    });

    // Cargar carrito desde localStorage
    cargarCarrito();
    actualizarCarrito();
    
    // Cargar productos desde la base de datos
    cargarProductosDesdeDB();
    
    // Verificar sesión
    verificarSesion();

    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                asunto: document.getElementById('asunto').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            // Enviar a la API PHP
            const response = await API.contacto.enviar(datos);
            
            if (response.success) {
                mostrarNotificacion(response.message);
                contactForm.reset();
            } else {
                mostrarNotificacion('Error al enviar el mensaje: ' + response.message);
            }
        });
    }
});

// Cargar productos en el panel de administración
async function cargarProductosAdmin() {
    const response = await API.productos.obtenerTodos();
    if (response.success) {
        const lista = document.getElementById('listaProductosAdmin');
        lista.innerHTML = response.data.map(producto => `
            <div class="admin-producto-item">
                <div class="admin-producto-info">
                    <strong>${producto.nombre}</strong>
                    <span>${parseFloat(producto.precio).toFixed(2)}€</span> - Stock: ${producto.stock}
                </div>
                <div class="admin-producto-actions">
                    <button class="btn-editar" onclick="editarProducto(${producto.id})">Editar</button>
                    <button class="btn-eliminar-admin" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }
}

// Editar producto
async function editarProducto(id) {
    const response = await API.productos.obtenerPorId(id);
    if (response.success) {
        const producto = response.data;
        document.getElementById('adminProductoId').value = producto.id;
        document.getElementById('adminNombre').value = producto.nombre;
        document.getElementById('adminDescripcion').value = producto.descripcion;
        document.getElementById('adminPrecio').value = producto.precio;
        document.getElementById('adminImagen').value = producto.imagen;
        document.getElementById('adminStock').value = producto.stock;
        
        // Scroll al formulario
        document.getElementById('adminProductoForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const response = await API.productos.eliminar(id);
    if (response.success) {
        mostrarNotificacion(response.message);
        cargarProductosAdmin();
        cargarProductosDesdeDB(); // Actualizar grid principal
    } else {
        mostrarNotificacion('Error: ' + response.message);
    }
}

// Función para agregar productos al carrito
async function agregarAlCarrito(nombre, precio) {
    // Intentar primero en backend PHP
    const response = await API.carrito.agregar({
        nombre: nombre,
        precio: precio,
        cantidad: 1
    });

    if (response.success && Array.isArray(response.carrito)) {
        carrito = response.carrito;
        actualizarCarrito();
        mostrarNotificacion(`${nombre} añadido al carrito`);
        return;
    }

    // Fallback local para evitar bloquear la compra si el backend no responde
    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            id: `local_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            nombre,
            precio: parseFloat(precio),
            cantidad: 1
        });
    }

    actualizarCarrito();
    mostrarNotificacion(`${nombre} añadido al carrito (modo local)`);
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notificacion);

    // Eliminar notificación después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Función para cargar carrito desde localStorage
async function cargarCarrito() {
    // Intentar cargar desde la sesión PHP
    const response = await API.carrito.obtener();
    if (response.success) {
        carrito = response.data || [];
    } else {
        // Fallback a localStorage si no hay conexión
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        }
    }
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    const carritoContador = document.getElementById('carritoContador');
    const carritoItems = document.getElementById('carritoItems');
    const totalCarrito = document.getElementById('totalCarrito');

    // Actualizar contador
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    carritoContador.textContent = totalItems;

    // Actualizar items
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
        totalCarrito.textContent = '0.00';
    } else {
        carritoItems.innerHTML = carrito.map(item => `
            <div class="carrito-item">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-precio">${item.precio.toFixed(2)}€</div>
                </div>
                <div class="item-cantidad">
                    <button class="cantidad-btn" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="cantidad-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                </div>
                <div class="item-subtotal">${(item.precio * item.cantidad).toFixed(2)}€</div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
            </div>
        `).join('');

        // Calcular total
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        totalCarrito.textContent = total.toFixed(2);
    }

    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para cambiar cantidad
async function cambiarCantidad(id, cantidad) {
    const item = carrito.find(item => item.id == id);
    if (item) {
        const nuevaCantidad = item.cantidad + cantidad;
        
        if (nuevaCantidad <= 0) {
            await eliminarDelCarrito(id);
        } else {
            // Actualizar en PHP
            const response = await API.carrito.actualizar(id, nuevaCantidad);
            if (response.success) {
                item.cantidad = nuevaCantidad;
                actualizarCarrito();
            }
        }
    }
}

// Función para eliminar del carrito
async function eliminarDelCarrito(id) {
    const response = await API.carrito.eliminar(id);
    if (response.success) {
        carrito = carrito.filter(item => item.id != id);
        actualizarCarrito();
        mostrarNotificacion('Producto eliminado del carrito');
    }
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
