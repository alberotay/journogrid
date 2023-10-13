async function getRss(){
        let fetched =  await fetch('/rss');
        return await fetched.json()
}


getRss().then((res)=> {

    $("body").append('<div id ="allFeeds" class="parent">');
    res.forEach((t,i) => {

        if(t.allFeeds.length > 0) {
            console.log('adding column for: ' + t.source)
            $('#allFeeds').append('<li id ="' + t.source + 'Column" class= "fit">');
            $('#' + t.source + 'Column').append('<div id ="' + t.source + 'Header" class= "header" />');
            $('#' + t.source + 'Header').append('<button id ="' + t.source + 'ToggleButton" class="minimize-button"  />');
            $('body').on('click', '#' + t.source + 'ToggleButton', function () {
                toggleColumn(t.source + 'Column')
            });
            $('#' + t.source + 'Header').append('<h1 id ="' + t.source + 'H1"/>');

            $('#' + t.source + 'H1').append('<img style="width: 100%;" src="' + t.frontEndImage + '" alt="' + t.source + 'Logo" />');
            $('#' + t.source + 'H1').append('<button id ="' + t.source + 'MoveUpButton" class="move-up-button" />↑');
            $('body').on('click', '#' + t.source + 'MoveUpButton', function () {
                moveNewsUp(t.source + 'News')


            });
            $('#' + t.source + 'H1').append('<button id ="' + t.source + 'MoveDownButton" class="move-down-button" />↓');
            //revisar esto de news
            $('body').on('click', '#' + t.source + 'MoveDownButton', function () {
                moveNewsDown(t.source + 'News', this)
            });

            $('#' + t.source + 'Column').append('<div id ="' + t.source + 'News" class= "news-container" />');
            t.allFeeds.forEach((y, j) => {
                console.log(y)
                $('#' + y.source + 'News').append('<div id ="' + y.source + 'New' + j + '" class= "news-item" />');
                $('#' + y.source + 'New' + j).append('<h2 id ="' + y.source + 'h2_' + j + '" style = "color: black; font-weight: bold;"  class= "news-title" />');

                $('#' + y.source + 'h2_' + j).append('<a id ="' + y.source + '_a_' + j + ' href= "' + y.link + '"  target="blank" />' + y.title + '');
                $('#' + y.source + 'New' + j).append('<div id ="' + y.source + 'NewsImageContainer_' + j + '" class= "news-image-container" />');
                $('#' + y.source + 'NewsImageContainer_' + j).append('<img id ="' + y.source + '_thumbNail_' + j + '" src="' + y.thumbnailUrl + '"  class= "news-image" />');
                $('#' + y.source + 'New' + j).append('<h3 id ="' + y.source + 'h3_' + j + '"  />');
                $('#' + y.source + 'h3_' + j).append('<div id ="' + y.source + '_newsContent_' + j + '" class ="news-content" />');
                $('#' + y.source + '_newsContent_' + j).append('<div id ="' + y.source + '_newsDescription_' + j + '" class ="news-desciption" />');
                $('#' + y.source + '_newsDescription_' + j).append('<p  />' + new Date(y.pubDate).toLocaleString() + ' fuente: ' + t.source);
                $('#' + y.source + '_newsDescription_' + j).append('<p  />' + y.description);
            })
        }})
    $("li").hover(function() {
        $(this).toggleClass('scale-up').siblings('li').toggleClass('scale-down')
    })

})


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

    const columnId = container.closest('.news-container').id;

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

