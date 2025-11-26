/**
 * La Lista de Lectura - Implementación
 */

/**
 * Representa un libro en la lista de lectura.
 * @class
 */
class Libro {
    /**
     * Crea una instancia de un Libro.
     * @constructor
     * @param {string} titulo - El título del libro.
     * @param {string} genero - El género del libro.
     * @param {string} autor - El autor del libro.
     */
    constructor(titulo, genero, autor) {
        /** 
         * El título del libro
         * @type {string} 
         */
        this.titulo = titulo;
        /** 
         * El género del libro
         * @type {string} 
         */
        this.genero = genero;
        /** 
         * El autor del libro
         * @type {string} 
         */
        this.autor = autor;
        /** 
         * Estado de lectura del libro
         * @type {boolean} 
         */
        this.leido = false;
        /** 
         * Fecha en que se finalizó la lectura
         * @type {Date|null} 
         */
        this.fechaLectura = null;
    }
}

/**
 * Gestiona una lista de libros y el estado de lectura actual.
 * @class
 */
class ListaLibros {
    constructor() {
        /** 
         * Array que contiene todos los libros
         * @type {Array<Libro>} 
         */
        this.todosLosLibros = [];
        /** 
         * Contador de libros leídos
         * @type {number} 
         */
        this.librosLeidos = 0;
        /** 
         * Contador de libros no leídos
         * @type {number} 
         */
        this.librosNoLeidos = 0;
        /** 
         * El libro que se está leyendo actualmente
         * @type {Libro|null} 
         */
        this.libroActual = null;
        /** 
         * El siguiente libro en la lista para leer
         * @type {Libro|null} 
         */
        this.siguienteLibro = null;
        /** 
         * El último libro que se ha terminado de leer
         * @type {Libro|null} 
         */
        this.ultimoLibro = null;
    }

    /**
     * Agrega un nuevo libro a la lista.
     * @param {Libro} libro - El objeto libro a agregar.
     */
    agregar(libro) {
        this.todosLosLibros.push(libro);
        this.librosNoLeidos++;

        // Si es el primer libro, se convierte en el libro actual
        if (!this.libroActual) {
            this.libroActual = libro;
        }
        // Si hay un libro actual pero no siguiente, este se convierte en el siguiente
        else if (!this.siguienteLibro) {
            this.siguienteLibro = libro;
        }
    }

    /**
     * Marca el libro actual como leído y avanza al siguiente libro en la lista.
     * Actualiza los contadores y las referencias de libro actual, último y siguiente.
     */
    terminarLibroActual() {
        if (!this.libroActual) return;

        // 1. Marcar libro actual como leído
        this.libroActual.leido = true;
        this.libroActual.fechaLectura = new Date(Date.now());
        this.librosLeidos++;
        this.librosNoLeidos--;

        // 2. Cambiar último libro leído
        this.ultimoLibro = this.libroActual;

        // 3. Cambiar libro actual al siguiente libro
        this.libroActual = this.siguienteLibro;

        // 4. Cambiar siguiente libro al primer libro no leído encontrado
        // Buscamos el primer libro que NO esté leído y que NO sea el nuevo libro actual
        this.siguienteLibro = this.todosLosLibros.find(libro => !libro.leido && libro !== this.libroActual) || null;
    }
}

// --- Lógica de UI / DOM ---

const miListaLibros = new ListaLibros();

const inputTitulo = document.getElementById('title');
const inputAutor = document.getElementById('author');
const inputGenero = document.getElementById('genre');
const formularioAgregarLibro = document.getElementById('add-book-form');
const contenedorListaLibros = document.getElementById('book-list-container');
const elementoContadorLibros = document.getElementById('books-read-count');

// Ayudante para formatear fecha
/**
 * Formatea una fecha en un formato legible (día de la semana, día, mes y año).
 * @param {Date} fecha - La fecha a formatear.
 * @returns {string} La fecha formateada o una cadena vacía si la fecha es inválida.
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

/**
 * Renderiza la lista de libros en el DOM.
 * Crea elementos HTML para cada libro y asigna eventos de clic si corresponde.
 */
function renderizarListaLibros() {
    contenedorListaLibros.innerHTML = '';

    miListaLibros.todosLosLibros.forEach(libro => {
        const itemLibro = document.createElement('div');
        itemLibro.className = 'book-item';

        // Texto de estado
        let textoEstado = 'No Leído';
        if (libro.leido) {
            textoEstado = `Leído el ${formatearFecha(libro.fechaLectura)}`;
        } else if (libro === miListaLibros.libroActual) {
            textoEstado = 'Leyendo actual... (Click para terminar)';
        }

        itemLibro.innerHTML = `
            <div class="book-info">
                <h3>${libro.titulo}</h3>
                <p>${libro.autor}</p>
            </div>
            <div class="book-status ${libro.leido ? 'read' : 'unread'}">
                ${textoEstado}
            </div>
        `;

        // Evento click para marcar como leído (solo si es el libro actual y no está leído)
        if (libro === miListaLibros.libroActual && !libro.leido) {
            itemLibro.addEventListener('click', () => {
                miListaLibros.terminarLibroActual();
                renderizarListaLibros();
                actualizarFooter();
            });
            itemLibro.title = "Click para marcar como leído";
        }

        contenedorListaLibros.appendChild(itemLibro);
    });
}

/**
 * Actualiza el contador de libros leídos en el pie de página.
 */
function actualizarFooter() {
    elementoContadorLibros.textContent = `Libros Leídos: ${miListaLibros.librosLeidos} de ${miListaLibros.todosLosLibros.length}`;
}

formularioAgregarLibro.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = inputTitulo.value;
    const autor = inputAutor.value;
    const genero = inputGenero.value;

    if (titulo && autor && genero) {
        const nuevoLibro = new Libro(titulo, genero, autor);
        miListaLibros.agregar(nuevoLibro);

        // Limpiar inputs
        inputTitulo.value = '';
        inputAutor.value = '';
        inputGenero.value = '';

        renderizarListaLibros();
        actualizarFooter();
    }
});

// Renderizado inicial
renderizarListaLibros();
actualizarFooter();
