import Citas from './classes/Citas.js';
import UI from './classes/ui.js';

import {
    mascotaInput,
    propietarioInput,
    telefonoInput,
    fechaInput,
    horaInput,
    sintomasInput,
    formulario
} from './selectores.js';

const ui = new UI();
const administrarCitas = new Citas();

let editando;
export let DB;

// Objeto con la información de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}

// Agrega datos al objeto de cita
export function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}

// Valida y agrega una nueva cita a la clase de citas
export function nuevaCita(e) {
    e.preventDefault();

    // Extraer la información del objeto de cita
    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // validar
    if ( mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '' ) {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    if ( editando ) {
        // Pasar el objeto de la cita a edición
        administrarCitas.editarCita({...citaObj});

        // Edita en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Editado correctamente');

            // Regresar el texto del botón a su estado original
            formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';
            
            // Quitar modo edición
            editando = false;
        }

        transaction.onerror = () => {
            console.log('Hubo un error');
        }

        
    } else {
        // Generar un id único
        citaObj.id = Date.now();

        // Creando una nueva cita
        administrarCitas.agregarCita({...citaObj});

        // Insertar registro en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');

        // Habilitar el objectStore
        const objectStore = transaction.objectStore('citas');

        // Insertar en la DB
        objectStore.add(citaObj);

        transaction.oncomplete = function() {
            // Mensaje de agregado correctamente
            ui.imprimirAlerta('Se agregó correctamente');
        }
    }

    // Mostrar el HTML de las citas
    ui.imprimirCitas();

    // Reiniciar el objeto para la validación
    reiniciarObjeto();

    // Resetear el formulario
    formulario.reset();
}

export function reiniciarObjeto() {
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}

export function eliminarCita(id) {
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = () => {
        // Muestre un mensaje
        ui.imprimirAlerta('La cita se eliminó correctamente');

        // Refrescar las citas
        ui.imprimirCitas();
    }

    transaction.onerror = () => {
        ui.imprimirAlerta('Hubo un error','error');
    }
}

// Carga los datos y el modo edición
export function cargarEdicion(cita) {
    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    // Llenar los inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    // Llenar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Cambiar el texto del botón
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

    editando = true;
}

export function crearDB() {
    // crear la base de datos en version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    // si hay un error
    crearDB.onerror = function() {
        console.log('Hubo un error');
    }

    // si todo sale bien
    crearDB.onsuccess = function() {
        console.log('DB creada');
        DB = crearDB.result;

        // Mostrar citas al cargar (pero indexedDb ya está listo)
        ui.imprimirCitas();
    }

    // definir el schema
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        // definir todas las columnas
        objectStore.createIndex('mascota', 'mascota', { unique: false });
        objectStore.createIndex('propietario', 'propietario', { unique: false });
        objectStore.createIndex('telefono', 'telefono', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        objectStore.createIndex('hora', 'hora', { unique: false });
        objectStore.createIndex('sintomas', 'sintomas', { unique: false });
        objectStore.createIndex('id', 'id', { unique: true });
    
        console.log('DB creada y lista');
    }
}