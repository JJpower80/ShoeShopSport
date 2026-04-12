/**
 * API Client - Maneja todas las peticiones al backend PHP
 */

const API = {
    baseURL: 'php/',

    // Métodos auxiliares para peticiones
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en la petición:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    // Productos
    productos: {
        obtenerTodos: () => API.request('productos.php'),
        obtenerPorId: (id) => API.request(`productos.php?id=${id}`),
        crear: (producto) => API.request('productos.php', {
            method: 'POST',
            body: JSON.stringify(producto)
        }),
        actualizar: (producto) => API.request('productos.php', {
            method: 'PUT',
            body: JSON.stringify(producto)
        }),
        eliminar: (id) => API.request('productos.php', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        })
    },

    // Carrito
    carrito: {
        obtener: () => API.request('carrito.php'),
        agregar: (producto) => API.request('carrito.php', {
            method: 'POST',
            body: JSON.stringify(producto)
        }),
        actualizar: (id, cantidad) => API.request('carrito.php', {
            method: 'PUT',
            body: JSON.stringify({ id, cantidad })
        }),
        eliminar: (id) => API.request('carrito.php', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        }),
        vaciar: () => API.request('carrito.php', {
            method: 'DELETE',
            body: JSON.stringify({ vaciar: true })
        })
    },

    // Contacto
    contacto: {
        enviar: (datos) => API.request('contacto.php', {
            method: 'POST',
            body: JSON.stringify(datos)
        })
    },

    // Pedidos
    pedidos: {
        crear: (datos) => API.request('pedidos.php', {
            method: 'POST',
            body: JSON.stringify(datos)
        }),
        obtenerTodos: () => API.request('pedidos.php'),
        obtenerPorId: (id) => API.request(`pedidos.php?id=${id}`)
    },

    // Pasarela de pago virtual
    pago: {
        procesar: (datos) => API.request('pago.php', {
            method: 'POST',
            body: JSON.stringify(datos)
        })
    },

    // Autenticación y Usuarios
    auth: {
        registro: (datos) => API.request('auth.php?action=registro', {
            method: 'POST',
            body: JSON.stringify(datos)
        }),
        login: (datos) => API.request('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify(datos)
        }),
        logout: () => API.request('auth.php?action=logout', {
            method: 'POST'
        }),
        perfil: () => API.request('auth.php?action=perfil'),
        actualizarPerfil: (datos) => API.request('auth.php', {
            method: 'PUT',
            body: JSON.stringify(datos)
        })
    }
};
