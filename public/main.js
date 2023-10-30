let lastResponse
let lastRequestTimeMilis = Date.now()
let allCategories = []
let minsRefresh = 5
let device


async function getRss() {
    let fetched = await fetch('/rss?lastView=' + lastRequestTimeMilis);
    return await fetched.json()
}


getRss().then((res) => {
    // console.log("antes update   ", lastRequestTimeMilis)

    $(document).ready(function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent)) {
            device = "mobile"
        } else {
            device = "desktop"
        }


        if (device === "mobile") {
            console.log("llega Mobile")
            fillMobileGrid(res)
            $('#bodyMobile').show();
            // Si "#bodyMobile" es visible, significa que es una vista móvil, entonces oculta la imagen con la clase "clock".
            $('.timer').hide();
            $('.navbar-text').hide();

        } else {
            console.log("llega Desktop")
            fillDesktop(res)
            fillDesktopGrid(res)
            $('#bodyDesktop').show();
            $('.timer').show();
            $('.navbar-text').show();
            $("li").hover(function () {
                $(this).toggleClass('scale-up').siblings('li').toggleClass('scale-down')
            })
        }


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
            $('#categoriasDropdown').append('<a class="dropdown-item"> <div class="form-check" > <input  checked value=' + value + ' class="form-check-input" type="checkbox" id="flexCheckDefault' + value + '">' +
                '  <label class="form-check-label" for="flexCheckDefault' + value + '">' + value.replaceAll("_", " ") + ' </label></div></a>');
        });
        $('#categoriasDropdown').on('change', 'input', function () {
            let elem = $(this);
            if (elem.is(':checked')) {
                $("[value|=" + elem.val() + "Column]").show()
                $("[value|=" + elem.val() + "Mobile]").show()
            }
            if (!elem.is(':checked')) {
                $("[value|=" + elem.val() + "Column]").hide()
                $("[value|=" + elem.val() + "Mobile]").hide()
            }
        });


        setTimer()
        updateLastRequestTimeInFront()


    })
})


function fillDesktop(res) {
    $("body").append('<div id ="lastRequestTime" />');
    $("#bodyDesktop").append('<div id ="containerAllFeeds" class="container-fluid">')
    res = sortColumnsByLastPreference(res)
    $("#containerAllFeeds").append('<div id ="allFeeds' + '" class="row marginRow list-group">');
    res.forEach((t, i) => {
            if (t.allFeeds.length > 0) {
                $('#allFeeds').append('<li id ="' + t.source + 'Column" class= "fit col-sm-1 list-group-item" value = "' + t.category + 'Column"> ')
                $('#' + t.source + 'Column').append('<div id ="' + t.source + 'Header" class= "header" />')
                    .append('<div id ="' + t.source + 'News" class= "news-container" />')
                    .prepend('<img id ="' + t.source + '_newLabel' + '" src="/newLabel.png"  class= "newLabel" />');
                $('#' + t.source + 'Header').append('<h1 id ="' + t.source + 'H1"/>');
                $('#' + t.source + 'H1').append('<img style="width: 100%;" src="' + t.frontEndImage + '" alt="' + t.source + 'Logo" />')
                    .append('<button title="Primera noticia" id ="' + t.source + 'MoveUpButton" class="move-up-button" />↑')
                    .append('<button title="Automático" id ="' + t.source + 'MoveDownButton" class="move-down-button" />↓')
                    .append('<button title="Arrastra el contenedor" class="move-down-button" />↔');
                $('body').on('click', '#' + t.source + 'MoveUpButton', function () {
                    moveNewsUp(t.source + 'News')
                }).on('click', '#' + t.source + 'MoveDownButton', function () {
                    moveNewsDown(t.source + 'News', this)
                });
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


            $('#' + source + 'News').empty()
            y.allFeeds.forEach((feed, j) => {
                $('#' + source + 'News').append('<div id ="' + source + 'New' + j + '" class= "news-item" />');
                $('#' + source + 'New' + j).append('<h2 id ="' + source + 'h2_' + j + '" style = "color: black; font-weight: bold;"  class= "news-title" />')
                    .append('<div id ="' + source + 'NewsImageContainer_' + j + '" class= "news-image-container" />')
                    .append('<h3 id ="' + source + 'h3_' + j + '"  />');
                $('#' + source + 'h2_' + j).append('<a id ="' + source + '_a_' + j + '" class= "news-title" href= "' + feed.link + '"  target="blank" href = "' + feed.link + '" />' + feed.title + '');
                $('#' + source + 'NewsImageContainer_' + j).append('<img id ="' + source + '_thumbNail_' + j + '" src="' + feed.thumbnailUrl + '"  class= "news-image" />');
                $('#' + source + 'h3_' + j).append('<div id ="' + source + '_newsContent_' + j + '" class ="news-content" />');
                addMinimalistInfo('#' + source + '_newsContent_' + j, feed, false, j)
                $('#' + source + '_newsContent_' + j).append('<div id ="' + source + '_newsDescription_' + j + '" class ="news-desciption" />');
                $('#' + source + '_newsDescription_' + j).append('<p class = "justifyText" />' + feed.description);
                enableDescriptionToggle('#' + source + '_newsDescription_' + j, '#' + source + '_verMas_' + j)
            })

            $("#" + source + "Column").addClass("newFeed")
            setTimeout(() => {
                $("#" + source + "Column").removeClass("newFeed")
            }, 2000)
            $("#" + source + "_newLabel").addClass("showMeNewLabel")
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
    let now = new Date()
    //Variable to Setup Only News from last 12h in order to avoid the news flooding
    let acceptNewsFromHoursBefore = 6
    let onlyNews = []
    res.forEach((data) => {
        onlyNews.push(data.allFeeds)
    })
    let mergedNews = onlyNews.flat(1)
    mergedNews = mergedNews.sort((a, b) => b.pubDate - parseFloat(a.pubDate));
    $("#bodyMobile").empty()
    mergedNews.forEach((data, i) => {
        if (data.pubDate > now - 1000 * 60 * 60 * acceptNewsFromHoursBefore) {
            $("#bodyMobile").append('<div id ="rowMobile' + i + '"  value = "' + data.category + 'Mobile" class = "news-item-mobile"/>')
            $("#rowMobile" + i).append('<div class="col-8"><p />' + data.category.replaceAll("_", " ") + '</div>')
                .append('<a href= "' + data.link + '"  class = "news-title" target="blank" href = "' + data.link + '" />' + data.title)
                .append('<img src="' + data.thumbnailUrl + '"  class= "news-image marginTopMobileImage" />')
            addMinimalistInfo("#rowMobile" + i, data, true, i)
            $("#rowMobile" + i).append('<div id ="' + data.source + '_newsDescriptionMobile_' + i + '" class ="news-desciption" >')
            $("#" + data.source + "_newsDescriptionMobile_" + i).append('<p class = "justifyText" />' + data.description)

            enableDescriptionToggle('#' + data.source + '_newsDescriptionMobile_' + i, '#' + data.source + '_verMasMobile_' + i)
        }
    })
}


setInterval(() => getRss().then((res) => {
    if (device === "mobile") {
        fillMobileGrid(res)
    } else {
        fillDesktopGrid(res)
    }
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

function enableDescriptionToggle(newsDescriptionSelector, verMasSelector) {
    $(newsDescriptionSelector).hide()
    $('body').on('click', verMasSelector, function () {
        if ($(newsDescriptionSelector).is(":visible")) {
            $(verMasSelector).removeClass('bi bi-box-arrow-in-up').addClass('bi bi-box-arrow-in-down')
            $(newsDescriptionSelector).hide()
        } else {
            $(verMasSelector).addClass('bi bi-box-arrow-in-up').removeClass('bi bi-box-arrow-in-down')
            $(newsDescriptionSelector).show()
        }
    });
}


function addMinimalistInfo(parentElementId, feed, isMobile, i) {
    let stringVerMas = isMobile ? "_verMasMobile_" : "_verMas_"
    let stringMinimalist = isMobile ? "_minMobile_" : "_min_"
    let linkToShare = feed.link;
    let image = '<img style="width: 19px; height: 19px; border-radius: 4px;" src="./logos/' + feed.source + 'SmallLogo.svg" alt="" />';

    $(parentElementId).append('<div id="' + feed.source + stringMinimalist + i + '" class="minimalist-data" style="width: 100%;"/>')
    $('#' + feed.source + stringMinimalist + i).append('<span class="news-date"  />' + image + " " + new Date(feed.pubDate).toLocaleString())
        .append('<i class="bi bi-box-arrow-down news-icon" id="' + feed.source + stringVerMas + i + '" />')
        .append('<div class="icons-right" id="' + feed.source + stringVerMas + i + 'ShareIcons" />')
    $('#' + feed.source + stringVerMas + i + 'ShareIcons').append('<a href="https://api.whatsapp.com/send?text=¡Visto en JournoGrid en ACOSTA.FUN !' + encodeURIComponent(linkToShare) + '" target="_blank" class="no-decoration"><img src="./logos/whatsapp.svg" class="news-icon-wats" alt=""/> </a>')
        .append('<a href="https://t.me/share/url?url=' + encodeURIComponent(linkToShare) + '&text=¡Visto en JournoGrid en ACOSTA.FUN !" target="_blank" class="no-decoration"> <img src="./logos/telegram.svg" class="news-icon-telegram" alt=""/></a>')
}

function updateLocalStorageOrder() {
    let orderArray = []
    document.querySelectorAll(".fit").forEach((data) => orderArray.push(data.id.replace("Column", "")))
    window.localStorage.setItem("columnsOrder", JSON.stringify(orderArray))
}

function setTimer() {
    let countdown = $("#timer").countdown360({
        radius: 11,
        strokeStyle: "#ffffff",
        strokeWidth: 6,
        fillStyle: "#212529",
        fontColor: "#212529",
        fontFamily: "sans-serif",
        fontSize: undefined,
        fontWeight: 900,
        autostart: true,
        seconds: minsRefresh * 60,
        //label: ["segundo", "segundos"],
        startOverAfterAdding: true,
        smooth: true,
        onComplete: function () {
            countdown.start()
        }
    });
    countdown.start()
}

