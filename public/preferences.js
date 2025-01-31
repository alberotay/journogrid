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

function updateLocalStorageOrder() {
    const orderArray = Array.from(document.querySelectorAll(".fit"), el => el.id.replace("Column", ""));
    localStorage.setItem("columnsOrder", JSON.stringify(orderArray));
}