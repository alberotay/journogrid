// ==============================
// preferences.js
// Gestión y persistencia del orden de columnas (feeds) en el frontend
// Permite que el usuario personalice el orden y que su preferencia se mantenga en recargas futuras
// ==============================

/**
 * Ordena el array de feeds (`res`) según el último orden guardado por el usuario en localStorage.
 * Si no hay preferencias guardadas, devuelve el array tal cual.
 * @param {Array} res - Array de objetos feed con propiedad 'source'
 * @returns {Array} Array ordenado según preferencia, o tal cual si no hay orden previo
 */

function sortColumnsByLastPreference(res) {
    const storedOrder = JSON.parse(localStorage.getItem("columnsOrder"));

    if (storedOrder) {
        const preferredColumns = new Set(storedOrder);

        res.sort((a, b) => {
            const aPreferred = preferredColumns.has(a.source);
            const bPreferred = preferredColumns.has(b.source);

            if (aPreferred && !bPreferred) return -1;
            if (!aPreferred && bPreferred) return 1;
            if (aPreferred && bPreferred) return storedOrder.indexOf(a.source) - storedOrder.indexOf(b.source);
            return 0;
        });

        return res;
    }
    return res; // Simplified else: return res directly
}
/**
 * Actualiza el orden de columnas almacenado en localStorage
 * Debe llamarse cada vez que el usuario reorganiza columnas (drag & drop, por ejemplo)
 */
function updateLocalStorageOrder() {
    // Obtiene todos los elementos de columna por clase 'fit' y extrae su id (quitando el 'Column' final)
    const orderArray = Array.from(
        document.querySelectorAll(".fit"),
         el => el.id.replace("Column", ""));
    localStorage.setItem("columnsOrder", JSON.stringify(orderArray));
}