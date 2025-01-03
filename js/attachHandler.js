// attachHandler.js

export function handleAttach() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*,audio/*"; 
    
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const extension = file.name.split(".").pop().toLowerCase();
            const supportedExtensions = ["jpg", "jpeg", "png", "mp4", "mp3"];
            const message = supportedExtensions.includes(extension) 
                ? `Archivo soportado: ${file.name}` 
                : `Document attached: Archivos .${extension} aún no están soportados.`;
            alert(message);
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}
