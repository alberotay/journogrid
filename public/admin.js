$(document).ready(function() {
    $("#configurarRss").click(async function() {
        let categories = await fetch('/api/getAllCategories');
        const categoriesJson = await categories.json();

        let rssResponse = await fetch('/api/getAllRss');
        const rssJson = await rssResponse.json();

        const $content = $(".content");
        $content.empty();

        const $form = $("<form>").addClass("mb-3");
        const $card = $("<div>").addClass("card");
        const $cardBody = $("<div>").addClass("card-body").css("background-color", "#e0e0e0");

        const $row = $("<div>").addClass("row d-flex align-items-center");

        // Campo para Source (híbrido)
        const $sourceContainer = $("<div>").addClass("col-3");
        const $sourceSelect = $("<select>").addClass("form-control").attr("id", "sourceSelect");

        // Campo para maxElementsCache
        const $maxElementsCacheContainer = $("<div>").addClass("col-1");

        $("<option>").val("new").text("New").appendTo($sourceSelect);
        rssJson.forEach(rss => {
            $("<option>").val(rss.source).text(rss.source).appendTo($sourceSelect);
        });
        $sourceContainer.append($sourceSelect);
        $row.append($sourceContainer);

        const $sourceInput = $("<input>").attr("type", "text").addClass("form-control d-none").attr("id", "sourceInput").attr("placeholder", "Source (Escribe aquí)");
        $sourceContainer.append($sourceInput);


        // Evento change del select de source
        $sourceSelect.change(function() {
            const selectedSource = $(this).val();
            if (selectedSource === "new") {
                $sourceSelect.addClass("d-none");
                $sourceInput.removeClass("d-none").focus();
                $("#url").val("");
                $("#maxElementsCache").val(100);
                $("#category").val("");
            } else {
                $sourceSelect.removeClass("d-none");
                $sourceInput.addClass("d-none");
                const rss = rssJson.find(rss => rss.source === selectedSource);
                if (rss) {
                    $("#url").val(rss.url);
                    $("#category").val(rss.category);
                    $("#isActive").val(rss.isActive ? "true" : "false");
                }
            }
            if (selectedSource !== "new") {
                // ... (código anterior) ...
                $deleteButton.removeClass("d-none"); // Mostrar el botón Eliminar
            } else {
                // ... (código anterior) ...
                $deleteButton.addClass("d-none"); // Ocultar el botón Eliminar
            }

        });

        $row.append($("<div>").addClass("col-3").append($("<input>").attr("type", "text").addClass("form-control").attr("id", "url").attr("placeholder", "Url")));

        const $select = $("<select>").addClass("form-control").attr("id", "category");
        // Placeholder para categoría
        $("<option>").val("").text("Categoría").prop("disabled", true).prop("selected", true).appendTo($select);

        categoriesJson.forEach(category => {
            $("<option>").val(category.type).text(category.type).appendTo($select);
        });
        $row.append($("<div>").addClass("col-2").append($select));

        const $maxElementsCacheInput = $("<input>")
            .attr("type", "number")
            .addClass("form-control")
            .attr("id", "maxElementsCache")
            .attr("name", "maxElementsCache")  // Add the name attribute!
            .attr("placeholder", "Cache")
            .attr("min", "1"); // Minimum value (adjust as needed)
        $maxElementsCacheContainer.append($maxElementsCacheInput);
        $row.append($maxElementsCacheContainer);

        // Dropdown para isActive
        const $isActiveDropdown = $("<select>").addClass("form-control").attr("id", "isActive");
        $("<option>").val("true").text("Activo").appendTo($isActiveDropdown);
        $("<option>").val("false").text("Inactivo").appendTo($isActiveDropdown);
        $row.append($("<div>").addClass("col-1").append($isActiveDropdown));

        $row.append($("<div>").addClass("col-auto").append($("<button>").attr("type", "submit").attr("id", "guardarRss").addClass("btn btn-primary").text("Guardar")));
        const $deleteButton = $("<button>").attr("type", "button").attr("id", "deleteRss").addClass("btn btn-danger d-none").text("Eliminar");
        $row.append($("<div>").addClass("col-auto").append($deleteButton));


        $cardBody.append($row);
        $card.append($cardBody);
        $form.append($card);
        $content.append($form);

        // Simular el cambio a "new" después de crear el formulario
        $sourceSelect.val("new");
        $sourceSelect.change(); //Trigger the change

        $deleteButton.click(function() {
            const source = $("#sourceSelect").val(); // Obtener el ID de la fuente seleccionada

            if (confirm("¿Estás seguro de que quieres eliminar esta fuente?")) {
                $.post("/api/deleteRss", {
                    source: source
                }, async function(data) {
                    console.log("Fuente eliminada:", data);
                    let rssResponse = await fetch('/api/getAllRss');
                    generarTabla(await rssResponse.json());

                    // Limpiar los campos del formulario y ocultar el botón Eliminar
                    $("#sourceSelect").val("new").change();
                    $("#url").val("");
                    $("#category").val("");
                    $deleteButton.addClass("d-none");
                });
            }
        });

        $form.submit(function(event) {
            event.preventDefault();

            const source = $sourceInput.hasClass("d-none") ? $("#sourceSelect").val() : $("#sourceInput").val();
            const url = $("#url").val();
            const category = $("#category").val();
            const isActive = $("#isActive").val() === "true";
            const maxElementsCache =  $("#maxElementsCache").val()
            // Validación de campos obligatorios
            let isValid = true;
            if (!source) {
                $("#sourceSelect, #sourceInput").addClass("is-invalid");
                isValid = false;
            } else {
                $("#sourceSelect, #sourceInput").removeClass("is-invalid");
            }
            if (!url) {
                $("#url").addClass("is-invalid");
                isValid = false;
            } else {
                $("#url").removeClass("is-invalid");
            }
            if (!category) {
                $("#category").addClass("is-invalid");
                isValid = false;
            } else {
                $("#category").removeClass("is-invalid");
            }
            if (!maxElementsCache || maxElementsCache < 1) {
                $("#maxElementsCache").addClass("is-invalid");
                isValid = false;
            } else {
                $("#maxElementsCache").removeClass("is-invalid");
            }



            // Validación de la URL
            const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
            if (!urlPattern.test(url)) {
                $("#url").addClass("is-invalid");
                alert("Por favor, introduce una URL válida.");
                isValid = false;
            }

            // Enviar el formulario si todos los campos son válidos
            if (isValid) {
                $.post("/api/setRss", {
                    source: source,
                    url: url,
                    category: category,
                    isActive: isActive,
                    maxElementsCache: maxElementsCache
                }, async function(data) {
                    console.log("Datos enviados:", data);
                    let rssResponse = await fetch('/api/getAllRss');
                    generarTabla(await rssResponse.json());

                    // Limpiar los campos del formulario después del envío
                    $("#sourceSelect").val("new").change();
                    $("#url").val("");
                    $("#category").val("");
                });
            }
        });

        generarTabla(rssJson);
    });

    function generarTabla(data) {
        const $content = $(".content");
        $content.find("table").remove();

        if (data.length === 0) {
            $content.append("<p class='sin-datos'>No hay datos disponibles.</p>");
            return;
        }

        const $table = $("<table>").addClass("table");
        const $thead = $("<thead>").appendTo($table);
        const $tbody = $("<tbody>").appendTo($table);

        // Headers de la tabla (nuevos nombres)
        const headers = ["Fuente", "Url de la Fuente", "Categoría","Nº Noticias cache", "Activado?"];
        const headerKeys = ["source", "url", "category","maxElementsCache", "isActive"]; // Claves correspondientes en el JSON
        const $row = $("<tr>").appendTo($thead);
        headers.forEach(header => $("<th>").text(header).appendTo($row));

        data.forEach(item => {
            const $row = $("<tr>").appendTo($tbody);

            headerKeys.forEach(key => { // Usar headerKeys para acceder a las claves del JSON
                if (key === "isActive") {
                    $("<td>").text(item[key] ? "Sí" : "No").appendTo($row); // Mostrar "Sí" o "No" para "Activado?"
                } else {
                    $("<td>").text(item[key]).appendTo($row);
                }
            });

            // Evento click en la fila
            $row.click(function() {
                if (item.source === "new") {
                    $("#sourceSelect").val("new").change();
                    $("#sourceInput").val(item.source);
                } else {
                    $("#sourceSelect").val(item.source).change();
                }
                $("#url").val(item.url);
                $("#category").val(item.category);
                $("#isActive").val(item.isActive ? "true" : "false");
                $("#maxElementsCache").val(item.maxElementsCache);
                
            });
        });

        $content.append($table);
    }
});