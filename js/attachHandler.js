/**
 * Maneja el evento de adjuntar archivo en dispositivos móviles y de escritorio
 */
export function handleAttach() {
    // Crear un input de tipo file de manera dinámica
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    
    // Aceptar solo tipos de archivos multimedia (puedes modificar según tus necesidades)
    fileInput.accept = "image/*,video/*,audio/*"; 
    
    // Agrega un evento para manejar la selección del archivo
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0]; // Obtener el primer archivo seleccionado
        if (file) {
            const extension = file.name.split(".").pop().toLowerCase(); // Obtener la extensión del archivo
            
            // Verificar si la extensión está soportada
            const supportedExtensions = ["jpg", "jpeg", "png", "mp4", "mp3"];
            if (!supportedExtensions.includes(extension)) {
                alert(`Document attached: Archivos .${extension} aún no están soportados.`);
            } else {
                alert(`Archivo soportado: ${file.name}`);
            }
        }
    });

    // Disparar el clic en el input de archivo para abrir el selector
    fileInput.style.display = "none"; // Ocultar el input de archivo
    document.body.appendChild(fileInput); // Agregar al DOM temporalmente
    fileInput.click(); // Forzar el clic para abrir el selector de archivos
    document.body.removeChild(fileInput); // Eliminar del DOM después de usarlo
}
