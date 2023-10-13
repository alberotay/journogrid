async function getRss(){
        let fetched =  await fetch('/rss');
        return await fetched.json()
}


getRss().then((res)=> {


    res.forEach((t,i) => {
        console.log('adding column for: '+t.source)
        $("body").append('<div id ="'+t.source + 'Column" class= "news-column">');
        $('#'+t.source+'Column').append('<div id ="'+t.source+'Header" class= "header" />');
        $('#'+t.source+'Header').append('<button id ="'+t.source+'ToggleButton" class="minimize-button"  />');
        $('body').on('click','#'+t.source+'ToggleButton',function(){toggleColumn(t.source+'Column')});
        $('#'+t.source+'ToggleButton').append('<span id ="'+t.source+'Button"  />▶');
        $('#'+t.source+'Header').append('<h1 id ="'+t.source+'H1"/>');

        $('#'+t.source+'H1').append('<img style="width: 100%;" src="'+t.frontEndImage+'" alt="'+t.source+'Logo" />');
        $('#'+t.source+'H1').append('<button id ="'+t.source+'MoveUpButton" class="move-up-button" />↑');
        $('body').on('click','#'+t.source+'MoveUpButton',function(){moveNewsUp(t.source+'News')});
        $('#'+t.source+'H1').append('<button id ="'+t.source+'MoveDownButton" class="move-down-button" />↓');
        //revisar esto de news
        $('body').on('click','#'+t.source+'MoveDownButton',function(){moveNewsDown(t.source+'News',this)});
        $('#'+t.source+'Column').append('<div id ="'+t.source+'News" class= "news-container" />');
        t.allFeeds.forEach((y,j)=>{
            console.log(y)
            $('#'+y.source+'News').append('<div id ="'+y.source+'New'+j+'" class= "news-item" />');
            $('#'+y.source+'New'+j).append('<h2 id ="'+y.source+'h2_'+j+'" style = "color: black; font-weight: bold;"  class= "news-title" />');

            $('#'+y.source+'h2_'+j).append('<a id ="'+y.source+'_a_'+j+' href= "'+y.link+'"  target="blank" />'+y.title+'');
            $('#'+y.source+'New'+j).append('<div id ="'+y.source+'NewsImageContainer_'+j+'" class= "news-image-container" />');
            $('#'+y.source+'NewsImageContainer_'+j).append('<img id ="'+y.source+'_thumbNail_'+j+'" src="'+y.thumbnailUrl+'"  class= "news-image" />');
            $('#'+y.source+'New'+j).append('<h3 id ="'+y.source+'h3_'+j+'"  />');
            $('#'+y.source+'h3_'+j).append('<div id ="'+y.source+'_newsContent_'+j+'" class ="news-content" />');
            $('#'+y.source+'_newsContent_'+j).append('<div id ="'+y.source+'_newsDescription_'+j+'" class ="news-desciption" />');
            $('#'+y.source+'_newsDescription_'+j).append('<p  />'+ y.pubDate +' fuente: '+t.source);
            $('#'+y.source+'_newsDescription_'+j).append('<p  />'+ y.description);
        })
    })
})

// Función para alternar entre minimizar y restaurar columnas
function toggleColumn(columnId) {
    console.log(columnId)
    const column = document.getElementById(columnId);
    const container = column.querySelector('.news-container');
    const button = column.querySelector('.minimize-button');
    const title = column.querySelector('h1');

    // Obtener todas las columnas excepto la que se está minimizando
    const allColumns = document.querySelectorAll('.news-column');
    const otherColumns = Array.from(allColumns).filter(col => col !== column);

    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        button.classList.remove('collapsed');
        // Restaurar el ancho inicial
        column.style.width = "50%";
        title.style.display = 'block';

        // Distribuir automáticamente el espacio entre las otras columnas visibles
        const visibleColumns = Array.from(otherColumns).filter(col => col.querySelector('.news-container').style.display !== 'none');
        if (visibleColumns.length > 0) {
            const newWidth = 100 / (visibleColumns.length + 1) + '%';
            visibleColumns.forEach(col => {
                col.style.width = newWidth;
            });
        }
    } else {
        container.style.display = 'none';
        button.classList.add('collapsed');
        // Establecer el ancho a cero cuando se minimiza
        column.style.width = '0';
        title.style.display = 'none';

        // Distribuir automáticamente el espacio entre las otras columnas visibles
        const visibleColumns = Array.from(otherColumns).filter(col => col.querySelector('.news-container').style.display !== 'none');
        if (visibleColumns.length > 0) {
            const newWidth = 100 / visibleColumns.length + '%';
            visibleColumns.forEach(col => {
                col.style.width = newWidth;
            });
        }
    }
}

let scrollInterval;

function moveNewsUp(containerId) {
    const container = document.getElementById(containerId);
    const newsItemHeight = container.querySelector('.news-item').offsetHeight; // Altura de un elemento de noticias

    clearInterval(scrollInterval); // Detener cualquier desplazamiento anterior
    const downButtons = document.querySelectorAll('.move-down-button');
    downButtons.forEach(button => button.classList.remove('active'));

    if (container.scrollTop > 0) {
        container.scrollTop -= newsItemHeight;
    } else {
        // Si ya está en la parte superior, detener el intervalo y mantener en la parte superior
        clearInterval(scrollInterval);
    }
}
// Objeto para almacenar los intervalos por columna
const columnIntervals = {};


function moveNewsDown(containerId, button) {
    const container = document.getElementById(containerId);
    const newsItemHeight = container.querySelector('.news-item').offsetHeight; // Altura de un elemento de noticias

    const columnId = container.closest('.news-column').id;

    clearInterval(columnIntervals[columnId]); // Detener el intervalo anterior

    button.classList.add('active'); // Agregar clase para cambiar el color a verde

    columnIntervals[columnId] = setInterval(() => {
        if (container.scrollTop < container.scrollHeight - container.clientHeight) {
            container.scrollTop += newsItemHeight;
        } else {
            // Si ya está en la parte inferior, mueve el primer elemento al final
            const firstItem = container.querySelector('.news-item');
            const lastItem = container.querySelector('.news-item:last-child');
            container.removeChild(firstItem);
            container.appendChild(firstItem);
            container.scrollTop = container.scrollHeight - container.clientHeight - newsItemHeight; // Ajusta el desplazamiento inicial
        }
    }, 10000); // Intervalo de desplazamiento en milisegundos (10 segundos en este ejemplo)
}

