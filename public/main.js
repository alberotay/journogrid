let lastResponse
let lastRequestTimeMilis = Date.now()
let allCategories = []


async function getRss() {
    let fetched = await fetch('/rss?lastView=' + lastRequestTimeMilis);
    return await fetched.json()
}

$(document).ready(function () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent)) {
        console.log("llega Mobile")
        $('#bodyMobile').show();
    } else {
        console.log("llega Desktop")
        $('#bodyDesktop').show();
    }
});

getRss().then((res) => {
    console.log("antes update   ", lastRequestTimeMilis)
    fillDesktop(res)
    fillDesktopGrid(res)
    updateLastRequestTimeInFront()
    console.log("despues update ", lastRequestTimeMilis)
    console.log('----------------')
    $("li").hover(function () {
        $(this).toggleClass('scale-up').siblings('li').toggleClass('scale-down')
    })

    res.forEach((element) => {
        allCategories.indexOf(element.category) === -1 ? allCategories.push(element.category) : null;

        $('#' + element.source + 'Column').hover(function () {
            $("#" + element.source + "_newLabel").removeClass("showMeNewLabel")
        })
    })

    allCategories.forEach((value, index) => {
     //   <li><a className="dropdown-item" href="#">Something else here</a></li>
        $('#selectorCategorias').append('<li><input class = "marginRow" checked type="checkbox"  value='+ value + '>'+"  "+value+'</input></li>');

    });
    $('#selectorCategorias').on('change', 'input', function () {
        let elem = $(this);
        if (elem.is(':checked')) {
            $("[value|=" + elem.val() + "Column]").show()
        }
        if (!elem.is(':checked')) {
            $("[value|=" + elem.val() + "Column]").hide()
        }
    });


})


function fillDesktop(res) {
    $("body").append('<div id ="lastRequestTime" />');
    $("#bodyDesktop").append('<div id ="containerAllFeeds" class="container-fluid">')

    $("#containerAllFeeds").append('<div id ="allFeeds' + '" class="row marginRow">');
    res.forEach((t, i) => {
        if (t.allFeeds.length > 0) {
            $('#allFeeds').append('<li id ="' + t.source + 'Column" class= "fit col-sm-1" value = "'+t.category+'Column"> ');
                $('#' + t.source + 'Column').append('<div id ="' + t.source + 'Header" class= "header" />');
                $("#" + t.source + "Column").prepend('<img id ="' + t.source + '_newLabel' + '" src="/newLabel.png"  class= "newLabel" />');
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
            }
        }
    )
}

function testHide() {
    $('#allFeeds :input').filter(function () {
        return this.value == 'Nacional'
    }).hide()
}

function fillDesktopGrid(res) {

    res.forEach((y) => {
        $("#" + y.source + "_newLabel").removeClass("showMeNewLabel")
        if (y.hasNewElements || $("#" + y.source + "News").find("div").length === 0) {
            // console.log("new items")
            let source = y.source

            $("#" + source + "Column").addClass("newFeed")
            setTimeout(() => {
                $("#" + source + "Column").removeClass("newFeed")
            }, 500)
            $("#" + source + "_newLabel").addClass("showMeNewLabel")
            $('#' + source + 'News').empty()
            y.allFeeds.forEach((feed, j) => {
                $('#' + source + 'News').append('<div id ="' + source + 'New' + j + '" class= "news-item" />');
                $('#' + source + 'New' + j).append('<h2 id ="' + source + 'h2_' + j + '" style = "color: black; font-weight: bold;"  class= "news-title" />');
                $('#' + source + 'h2_' + j).append('<a id ="' + source + '_a_' + j + ' href= "' + feed.link + '"  target="blank" href = "'+feed.link+'" />' + feed.title + '');
                $('#' + y.source + 'New' + j).append('<div id ="' + source + 'NewsImageContainer_' + j + '" class= "news-image-container" />');
                $('#' + source + 'NewsImageContainer_' + j).append('<img id ="' + source + '_thumbNail_' + j + '" src="' + feed.thumbnailUrl + '"  class= "news-image" />');
                $('#' + source + 'New' + j).append('<h3 id ="' + source + 'h3_' + j + '"  />');
                $('#' + source + 'h3_' + j).append('<div id ="' + source + '_newsContent_' + j + '" class ="news-content" />');

                // Coloca la fecha y el icono en el mismo elemento
                $('#' + source + '_newsContent_' + j).append('<div class="news-date-icon"><span class="news-date">' + new Date(feed.pubDate).toLocaleString() +
                    '</span><i class="bi bi-box-arrow-down news-icon" id="' + source + '_verMas_' + j + '"></i></div>');

                $('#' + source + '_newsContent_' + j).append('<div id ="' + source + '_newsDescription_' + j + '" class ="news-desciption" />');
                $('#' + source + '_newsDescription_' + j).append('<p  />' + feed.description);
                $('#' + source + '_newsDescription_' + j).hide()

                $('body').on('click', '#' + source + '_verMas_' + j, function () {
                    if ($('#' + source + '_newsDescription_' + j).is(":visible")) {
                        $('#' + source + '_verMas_' + j).removeClass('bi bi-box-arrow-in-up')
                        $('#' + source + '_verMas_' + j).addClass('bi bi-box-arrow-in-down')
                        $('#' + source + '_newsDescription_' + j).hide()
                    } else {
                        $('#' + source + '_verMas_' + j).addClass('bi bi-box-arrow-in-up')
                        $('#' + source + '_verMas_' + j).removeClass('bi bi-box-arrow-in-down')
                        $('#' + source + '_newsDescription_' + j).show()

                    }
                });
            })
        }

    });

}


let minsRefresh = 2

setInterval(() => getRss().then((res) => {
    fillDesktopGrid(res)
    updateLastRequestTimeInFront()
}), 1000 * 60 * minsRefresh)

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


function updateLastRequestTimeInFront() {
    lastRequestTimeMilis = Date.now()
    $("#lastRequestTime").empty()
    $("#lastRequestTime").append(lastRequestTimeMilis)
}
