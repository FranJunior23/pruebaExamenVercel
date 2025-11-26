// Asegúrate de que las clases Libro y ListaLibros estén accesibles en este archivo de prueba
// Si usas módulos ES6, necesitarías 'import' aquí.
// Ejemplo:
// import { Libro, ListaLibros } from './lista-libros'; 

// Las pegamos aquí para que el ejemplo sea autocontenido:

class Libro {
    constructor(titulo, genero, autor) {
        this.titulo = titulo;
        this.genero = genero;
        this.autor = autor;
        this.leido = false;
        this.fechaLectura = null;
    }
}

class ListaLibros {
    constructor() {
        this.todosLosLibros = [];
        this.librosLeidos = 0;
        this.librosNoLeidos = 0;
        this.libroActual = null;
        this.siguienteLibro = null;
        this.ultimoLibro = null;
    }

    agregar(libro) {
        this.todosLosLibros.push(libro);
        this.librosNoLeidos++;

        if (!this.libroActual) {
            this.libroActual = libro;
        }
        else if (!this.siguienteLibro) {
            this.siguienteLibro = libro;
        }
    }

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
        this.siguienteLibro = this.todosLosLibros.find(libro => !libro.leido && libro !== this.libroActual) || null;
    }
}


// --- INICIO DE LAS PRUEBAS ---

describe('Clase Libro', () => {
    test('El constructor debe inicializar las propiedades correctamente', () => {
        const libro = new Libro('Cien Años de Soledad', 'Realismo Mágico', 'Gabriel García Márquez');
        expect(libro.titulo).toBe('Cien Años de Soledad');
        expect(libro.genero).toBe('Realismo Mágico');
        expect(libro.autor).toBe('Gabriel García Márquez');
        expect(libro.leido).toBe(false);
        expect(libro.fechaLectura).toBe(null);
    });
});

describe('Clase ListaLibros', () => {
    let lista;
    let libroA, libroB, libroC, libroD;

    // Se ejecuta antes de cada prueba (test) para asegurar un estado limpio
    beforeEach(() => {
        lista = new ListaLibros();
        libroA = new Libro('Libro A', 'Ficción', 'Autor 1');
        libroB = new Libro('Libro B', 'Ficción', 'Autor 2');
        libroC = new Libro('Libro C', 'Ficción', 'Autor 3');
        libroD = new Libro('Libro D', 'Ficción', 'Autor 4');
    });

    // --- Prueba del Constructor ---
    test('El constructor debe inicializar los contadores y referencias a null/vacío', () => {
        expect(lista.todosLosLibros).toEqual([]);
        expect(lista.librosLeidos).toBe(0);
        expect(lista.librosNoLeidos).toBe(0);
        expect(lista.libroActual).toBe(null);
        expect(lista.siguienteLibro).toBe(null);
        expect(lista.ultimoLibro).toBe(null);
    });

    // --- Prueba del método agregar() ---
    describe('Método agregar()', () => {
        test('Debe agregar el primer libro como libroActual', () => {
            lista.agregar(libroA);
            expect(lista.todosLosLibros.length).toBe(1);
            expect(lista.libroActual).toBe(libroA);
            expect(lista.siguienteLibro).toBe(null);
            expect(lista.librosNoLeidos).toBe(1);
        });

        test('Debe agregar el segundo libro como siguienteLibro', () => {
            lista.agregar(libroA);
            lista.agregar(libroB);
            expect(lista.todosLosLibros.length).toBe(2);
            expect(lista.libroActual).toBe(libroA);
            expect(lista.siguienteLibro).toBe(libroB);
            expect(lista.librosNoLeidos).toBe(2);
        });

        test('Debe agregar libros subsiguientes a la lista pero no cambiar libroActual/siguienteLibro', () => {
            lista.agregar(libroA);
            lista.agregar(libroB);
            lista.agregar(libroC);
            expect(lista.todosLosLibros.length).toBe(3);
            expect(lista.libroActual).toBe(libroA);
            expect(lista.siguienteLibro).toBe(libroB);
            expect(lista.librosNoLeidos).toBe(3);
        });
    });

    // --- Prueba del método terminarLibroActual() ---
    describe('Método terminarLibroActual()', () => {
        beforeEach(() => {
            // Estado inicial: A (actual), B (siguiente), C (pendiente)
            lista.agregar(libroA);
            lista.agregar(libroB);
            lista.agregar(libroC);
        });

        test('Debe actualizar los contadores y el estado del libro actual', () => {
            lista.terminarLibroActual();
            expect(lista.librosLeidos).toBe(1);
            expect(lista.librosNoLeidos).toBe(2);
            expect(libroA.leido).toBe(true);
            expect(libroA.fechaLectura).toBeInstanceOf(Date);
        });

        test('Debe actualizar correctamente el ultimoLibro', () => {
            lista.terminarLibroActual();
            expect(lista.ultimoLibro).toBe(libroA);
        });

        test('Debe cambiar libroActual a siguienteLibro', () => {
            lista.terminarLibroActual();
            // Libro actual ahora es B
            expect(lista.libroActual).toBe(libroB);
        });

        test('Debe encontrar el nuevo siguienteLibro (el primero no leído que no sea el actual)', () => {
            lista.terminarLibroActual(); 
            // Libro A leído. Libro actual es B. Libro C es el siguiente no leído.
            expect(lista.siguienteLibro).toBe(libroC); 
        });

        test('Debe manejar el escenario sin siguiente libro no leído', () => {
            lista.agregar(libroD); // Estado inicial: A, B, C, D
            
            // Termina A (A=leído, Actual=B, Siguiente=C)
            lista.terminarLibroActual(); 
            
            // Termina B (B=leído, Actual=C, Siguiente=D)
            lista.terminarLibroActual(); 
            
            // Termina C (C=leído, Actual=D, Siguiente=null)
            lista.terminarLibroActual(); 
            
            expect(lista.librosLeidos).toBe(3);
            expect(lista.libroActual).toBe(libroD);
            expect(lista.siguienteLibro).toBe(null); 
            
            // Termina D (D=leído, Actual=null, Siguiente=null)
            lista.terminarLibroActual(); 
            
            expect(lista.librosLeidos).toBe(4);
            expect(lista.libroActual).toBe(null);
            expect(lista.siguienteLibro).toBe(null);
            expect(lista.ultimoLibro).toBe(libroD);
        });
        
        test('No debe hacer nada si no hay libroActual', () => {
            lista = new ListaLibros(); // Lista vacía
            lista.terminarLibroActual();
            
            expect(lista.librosLeidos).toBe(0);
            expect(lista.librosNoLeidos).toBe(0);
            expect(lista.ultimoLibro).toBe(null);
        });
    });
});