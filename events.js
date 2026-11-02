// Motor de dialogos de BLOM

const dialogueContainer = document.querySelector(".dialogue-text");
const dialogueParagraph = dialogueContainer ? dialogueContainer.querySelector("p") : null;

const FADE_DURATION = 800;


let dialogueSkipTimeout = null;
let dialogueSkippable = false;
let advanceDialogue = null; 

// click en cualquier parte de la pantalla salta la pausa (el fade se respeta igual)
document.addEventListener("click", () => {
    if (dialogueSkippable && advanceDialogue) {
        clearTimeout(dialogueSkipTimeout);
        advanceDialogue();
    }
});

// muestra dialogo en la pantalla, linea por linea
function showDialogue(lines, onComplete) {
    if (!dialogueContainer || !dialogueParagraph) {
        console.warn("Contenedor o párrafo de diálogo no encontrado.");
        return;
    }

    let i = 0;
    function advance() {
        dialogueSkippable = false;
        dialogueContainer.style.opacity = 0;
        setTimeout(showNext, FADE_DURATION);
    }
    function showNext() {
        if (i >= lines.length) {
            dialogueSkippable = false;
            if (onComplete) onComplete();
            return;
        }
        const line = lines[i];
        dialogueParagraph.textContent = line.text;
        dialogueContainer.style.opacity = 1;
        i++;
        advanceDialogue = advance;
        dialogueSkippable = true;
        dialogueSkipTimeout = setTimeout(advance, line.pause);
    }
    setTimeout(showNext, 1000);
}

// Arranca el flujo: saluda, muestra el intro, y al terminar muestra el outro
showDialogue(introDialogue, () => {
    showDialogue(outroDialogue);
});