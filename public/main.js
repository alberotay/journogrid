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
    fillMobileGrid(res)
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
    document.querySelector('.dropdown-menu').addEventListener('click', function (event) {
        event.stopPropagation();
    });


    allCategories.forEach((value, index) => {
        $('#categoriasDropdown').append('<lu><a class="dropdown-item"> <div class="form-check" > <input  checked value=' + value + ' class="form-check-input" type="checkbox" id="flexCheckDefault' + value + '">' +
            '  <label class="form-check-label" for="flexCheckDefault' + value + '">' + value.replaceAll("_", " ") + ' </label></div></a></lu>');
    });
    $('#categoriasDropdown').on('change', 'input', function () {
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

    res = sortColumnsByLastPreference(res)


    $("#containerAllFeeds").append('<div id ="allFeeds' + '" class="row marginRow list-group">');
    res.forEach((t, i) => {
            if (t.allFeeds.length > 0) {
                $('#allFeeds').append('<li id ="' + t.source + 'Column" class= "fit col-sm-1 list-group-item" value = "' + t.category + 'Column"> ');
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


    if (window.localStorage.getItem("columnsOrder") === null) {
        updateLocalStorageOrder()
    }
}

function fillDesktopGrid(res) {
    res = sortColumnsByLastPreference(res)
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
                $('#' + source + 'h2_' + j).append('<a id ="' + source + '_a_' + j + ' href= "' + feed.link + '"  target="blank" href = "' + feed.link + '" />' + feed.title + '');
                $('#' + y.source + 'New' + j).append('<div id ="' + source + 'NewsImageContainer_' + j + '" class= "news-image-container" />');
                $('#' + source + 'NewsImageContainer_' + j).append('<img id ="' + source + '_thumbNail_' + j + '" src="' + feed.thumbnailUrl + '"  class= "news-image" />');
                $('#' + source + 'New' + j).append('<h3 id ="' + source + 'h3_' + j + '"  />');
                $('#' + source + 'h3_' + j).append('<div id ="' + source + '_newsContent_' + j + '" class ="news-content" />');

                // Coloca la fecha y el icono en el mismo elemento y ahora tmb el iconito chuli

                let image = '<img style="width: 18px; height: 18px; border-radius: 4px;" src="./logos/' + feed.source + 'SmallLogo.svg" alt="" />';
                $('#' + source + '_newsContent_' + j).append('<div class="news-date-icon"><span class="news-date">' + image + " " + new Date(feed.pubDate).toLocaleString() +
                    '</span><i class="bi bi-box-arrow-down news-icon" id="' + source + '_verMas_' + j + '"></i></div>');

                $('#' + source + '_newsContent_' + j).append('<div id ="' + source + '_newsDescription_' + j + '" class ="news-desciption" />');
                $('#' + source + '_newsDescription_' + j).append('<p class = "justifyText" />' + feed.description);
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
    Sortable.create(allFeeds, {
        animation: 100,
        group: 'list-1',
        draggable: '.list-group-item',
        handle: '.list-group-item',
        sort: true,
        filter: '.sortable-disabled',
        chosenClass: 'active',
        onEnd: function () {
            updateLocalStorageOrder()
        }
    });

}


function fillMobileGrid(res) {
    let onlyNews = []
    res.forEach((data) => {
        onlyNews.push(data.allFeeds)
    })
    let mergedNews = onlyNews.flat(1)
    mergedNews = mergedNews.sort((a, b) => b.pubDate - parseFloat(a.pubDate));
    console.log(mergedNews)
    mergedNews.forEach((data, i) => {
        let image = '<img style="width: 18px; height: 18px; border-radius: 4px;" src="./logos/' + data.source + 'SmallLogo.svg" alt="" />';
        $("#bodyMobile").append('  <div className="row" class = "news-item-mobile"/>' +
            '            <div className="col-2">'+
            '<h2 href= "' + data.link + '"  class = "news-title" target="blank" href = "' + data.link + '" />' + data.title +
            '<img src="' + data.thumbnailUrl + '"  class= "news-image marginTopMogileImage" />'+
            '<div class="news-date-icon"><span class="news-date">' + image + " " + new Date(data.pubDate).toLocaleString() +
            '</span><i class="bi bi-box-arrow-down news-icon" id="verMasMobile_' + i + '"></i></div>'+
            '<div id ="newsDescriptionMobile_' + i + '" class ="news-desciption" >'+
            '<p class = "justifyText" />' + data.description+
            '</div>'+
            '</div>')

        $('#newsDescriptionMobile_' + i).hide()

        $('body').on('click', '#verMasMobile_' + i, function () {
            if ($('#newsDescriptionMobile_' + i).is(":visible")) {
                $('#verMasMobile_' + i).removeClass('bi bi-box-arrow-in-up')
                $('#verMasMobile_' + i).addClass('bi bi-box-arrow-in-down')
                $('#newsDescriptionMobile_' + i).hide()
            } else {
                $('#verMasMobile_' + i).addClass('bi bi-box-arrow-in-up')
                $('#verMasMobile_' + i).removeClass('bi bi-box-arrow-in-down')
                $('#newsDescriptionMobile_' + i).show()

            }
        });

    })

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
    $("#lastUpdate").html("Última actualización: " + new Date(lastRequestTimeMilis).toLocaleString())
}


function sortColumnsByLastPreference(res) {
    let resSources = []
    if (JSON.parse(window.localStorage.getItem("columnsOrder"))) {

        let a = JSON.parse(window.localStorage.getItem("columnsOrder"))
        res.forEach((data) => resSources.push(data.source))
        let filtered = resSources.filter(x => !a.includes(x))
        filtered.forEach((data, i) => {
            a.push(data)
        })
        console.log(filtered)
        let sortInsert = function (acc, cur) {
            var toIdx = R.indexOf(cur.source, a);
            acc[toIdx] = cur;
            return acc;
        };
        let sort = R.reduceRight(sortInsert, []);

        return sort(res)
    } else {
        return res
    }
}

function updateLocalStorageOrder() {
    let orderArray = []
    console.log("recalculando orden")
    document.querySelectorAll(".fit").forEach((data) => orderArray.push(data.id.replace("Column", "")))
    window.localStorage.setItem("columnsOrder", JSON.stringify(orderArray))
    console.log("nuevo orden: " + window.localStorage.getItem("columnsOrder"))
}

