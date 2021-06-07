import { eliminarCita, cargarEdicion, DB } from '../funciones.js';
import { contenedorCitas } from '../selectores.js';

class UI {
    imprimirAlerta(mensaje, tipo) {
        // Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

        // Agregar clase en base al tipo de error
        if ( tipo === 'error' ) {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Agregar al DOM
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));
        
        // Quitar la alerta
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirCitas() {
        this.limpiarHTML();

        // Leer el contenido de la base de datos
        const objectStore = DB.transaction('citas').objectStore('citas');

        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;

            if(cursor) {
                const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cursor.value;
            
                const divCita = document.createElement('div');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                // Scripting de los elementos de la cita
                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;
                
                const propietarioParrafo = document.createElement('p');
                propietarioParrafo.innerHTML = `
                    <span class="font-weight-bolder">Propietario: </span>${propietario}
                `;

                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `
                    <span class="font-weight-bolder">Teléfono: </span>${telefono}
                `;

                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Fecha: </span>${fecha}
                `;
                
                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Hora: </span>${hora}
                `;

                const sintomasParrafo = document.createElement('p');
                sintomasParrafo.innerHTML = `
                    <span class="font-weight-bolder">Sintomas: </span>${sintomas}
                `;

                // Botón para eliminar esta cita
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = `Eliminar <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`;
                btnEliminar.onclick = () => eliminarCita(id);

                // Añade un botón para editar
                const btnEditar = document.createElement('button');
                const cita = cursor.value;
                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>`;
                btnEditar.onclick = () => cargarEdicion(cita);

                // Agregar al HTML
                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                contenedorCitas.appendChild(divCita);

                // ve al siguiente elemento
                cursor.continue();
            }
        }
    }

    limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

export default UI;