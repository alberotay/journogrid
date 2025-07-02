let lastResponse
let lastRequestTimeMilis = Date.now()
let allCategories = []
let minsRefresh = 5
let device

//peticion para obtener noticias pasando parametro de la última carga
async function getRss() {
    let fetched = await fetch('/api/rss?lastView=' + lastRequestTimeMilis);
    return await fetched.json()
}

// Detección si el usuario  entra con móvil o desktop
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
            $('#aSearch').css('display', 'none'); // Esto debería ocultar el elemento directamente


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
//Crea estructuras de contenedores para la vista en escritorio
function fillDesktop(res) {
    $("body").append('<div id ="lastRequestTime" />');
    $("#bodyDesktop").append('<div id ="containerAllFeeds" class="container-fluid">');
    res = sortColumnsByLastPreference(res); // Assuming this function is defined elsewhere
    const $allFeeds = $('<div id ="allFeeds" class="row marginRow list-group">'); // Create the container element first
    $("#containerAllFeeds").append($allFeeds); // Append the container to the DOM

    res.forEach(t => {
        if (t.allFeeds.length > 0) {
            const $li = $(`<li name="newsColumn" id="${t.source}Column" class="fit col-sm-1 list-group-item" value="${t.category}Column">`);
            const $header = $(`<div id ="${t.source}Header" class= "header" />`);
            const $newsContainer = $(`<div id ="${t.source}News" class= "news-container" />`);
            const $h1 = $(`<h1 id ="${t.source}H1"/>`);
            const $img = $(`<img style="width: 100%;" src="${t.frontEndImage}" alt="${t.source}Logo" onerror="this.onerror=null;this.src='/logos/generic.svg';" />`);
            const $moveUpButton = $(`<button title="Primera noticia" id ="${t.source}MoveUpButton" class="btn btn-default"><span class="bi bi-arrow-up""></span></button>`);
            const $moveDownButton = $(`<button title="Automático" id ="${t.source}MoveDownButton"  class="btn btn-default bi bi-chevron-double-down"" />`);
            const $moveContainerButton = $(`<button type="button" title="Arrastra el contenedor" id="moveContainerButton" class="btn btn-default" /><span class="bi bi-arrows-move""></span></button>`);


            //$h1.append($img).append($moveUpButton).append($moveDownButton).append($moveContainerButton);
            $h1.append($img);
            $header.append($h1);
            $li.append($header).append($newsContainer)
            $allFeeds.append($li); // Append the <li> to the pre-created container

            $('body').off('click', '#' + t.source + 'MoveUpButton').on('click', '#' + t.source + 'MoveUpButton', () => moveNewsUp(t.source + 'News')); // Arrow function, .off() to prevent duplicate event handlers
            $('body').off('click', '#' + t.source + 'MoveDownButton').on('click', '#' + t.source + 'MoveDownButton', function () { // .off() to prevent duplicate event handlers
                moveNewsDown(t.source + 'News', this);
            });
        }
    });

    if (localStorage.getItem("columnsOrder") === null) {
        updateLocalStorageOrder(); // Assuming this function is defined elsewhere
    }
}
// Rellena el contenido de las columnas o contenedores
function fillDesktopGrid(res) {
    res = sortColumnsByLastPreference(res)
    res.forEach((y) => {
        if (y.hasNewElements || $("#" + y.source + "News").find("div").length === 0) {
            let source = y.source

            $('#' + source + 'News').empty()
            y.allFeeds.forEach((feed, j) => {
                $('#' + source + 'News').append('<div id ="' + source + 'New' + j + '" class= "news-item" />');
                $('#' + source + 'New' + j).append('<h2 id ="' + source + 'h2_' + j + '" style = "color: black; font-weight: bold;"  class= "news-title" />')
                    .append('<div id ="' + source + 'NewsImageContainer_' + j + '" class= "news-image-container" />')
                    .append('<h3 id ="' + source + 'h3_' + j + '"  />');

                $('#' + source + 'h2_' + j).append(
                    '<a id ="' + source + '_a_' + j + '" class= "news-title" href= "' + feed.link + '"  target="blank">' + feed.title + '</a>'
                );

                // ----- BLOQUE DE IMAGEN + PLAY -----
                let imgHtml;
               if (feed.videoUrl) {
    imgHtml = `
        <div class="news-video-thumb" data-video-url="${feed.videoUrl}">
            <img id ="${source}_thumbNail_${j}" loading="lazy" src="${feed.thumbnailUrl}" class="news-image" onerror="this.onerror=null;this.src='/logos/genericB.svg';"/>
            <button class="play-video-btn">
                <img src="/logos/play.svg" alt="Play" width="32" height="32">
            </button>
        </div>
    `;
} else {
    imgHtml = `<img id ="${source}_thumbNail_${j}" loading="lazy" src="${feed.thumbnailUrl}" class="news-image" onerror="this.onerror=null;this.src='/logos/genericB.svg';"/>`;
}

                $('#' + source + 'NewsImageContainer_' + j).append(imgHtml);
                // ----- FIN BLOQUE IMAGEN + PLAY -----

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
        }
    });

    // ---- EVENTO PLAY ----
    $(".news-image-container").off("click", ".play-video-btn").on("click", ".play-video-btn", function (e) {
    e.preventDefault();
    e.stopPropagation();
    let $container = $(this).closest(".news-video-thumb");
    let videoUrl = $container.data("video-url");
    if (!videoUrl) return;

    let playerHtml;
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        playerHtml = `<video controls autoplay style="width:100%;height:100%;border-radius:8px;max-height:80vh;">
                        <source src="${videoUrl}">
                        Tu navegador no soporta el video.
                    </video>`;
    } else {
        playerHtml = `<iframe src="${videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen
                     style="width:100%;height:100%;aspect-ratio:16/9;border-radius:8px;max-height:80vh;"></iframe>`;
    }

    // Muestra el modal y mete el player dentro
    $("#videoPlayerContainer").html(playerHtml);
    $("#videoModal").fadeIn(120);
});

// Cierra el modal al pulsar el botón de cerrar o el fondo oscuro
$("#closeVideoModal, .video-modal-backdrop").on("click", function () {
    $("#videoModal").fadeOut(120, function(){
        $("#videoPlayerContainer").empty();
    });
});


    // ---- Sortable ----
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
    let now = new Date();
    let acceptNewsFromHoursBefore = 6;
    let onlyNews = [];
    res.forEach((data) => {
        onlyNews.push(data.allFeeds);
    });
    let mergedNews = onlyNews.flat(1);
    mergedNews = mergedNews.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

    $("#bodyMobile").empty();
    mergedNews.forEach((data, i) => {
        if (Date.parse(data.pubDate) > now - 1000 * 60 * 60 * acceptNewsFromHoursBefore) {
            $("#bodyMobile").append('<div id="rowMobile' + i + '" value="' + data.category + 'Mobile" class="news-item-mobile"></div>');
            $("#rowMobile" + i).append('<div class="col-8"><p />' + data.category.replaceAll("_", " ") + '</div>');
            $("#rowMobile" + i).append('<a href="' + data.link + '" class="news-title" target="blank">' + data.title + '</a>');

            // ---- BLOQUE DE IMAGEN + PLAY ----
            let imgHtml;
            if (data.videoUrl) {
               imgHtml = `
                <div class="news-video-thumb" data-video-url="${data.videoUrl}">
                     <img src="${data.thumbnailUrl}" loading="lazy" class="news-image marginTopMobileImage" onerror="this.onerror=null;this.src='/logos/genericB.svg';"/>
                    <button class="play-video-btn">
                    <img src="/logos/play.svg" alt="Play" width="32" height="32">
                    </button>
                </div>
                `;
            } else {
                imgHtml = `<img src="${data.thumbnailUrl}" loading="lazy" class="news-image marginTopMobileImage" onerror="this.onerror=null;this.src='/logos/genericB.svg';"/>`;
            }
            $("#rowMobile" + i).append(imgHtml);
            // ---- FIN BLOQUE IMAGEN + PLAY ----

            addMinimalistInfo("#rowMobile" + i, data, true, i);
            $("#rowMobile" + i).append('<div id="' + data.source + '_newsDescriptionMobile_' + i + '" class="news-desciption"></div>');
            $("#" + data.source + "_newsDescriptionMobile_" + i).append('<p class="justifyText" />' + data.description);

            enableDescriptionToggle('#' + data.source + '_newsDescriptionMobile_' + i, '#' + data.source + '_verMasMobile_' + i);
        }
    });

    // EVENTO PLAY: Reemplaza imagen por reproductor al pulsar play
    $("#bodyMobile").off("click", ".play-video-btn").on("click", ".play-video-btn", function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $container = $(this).closest(".news-video-thumb");
        let videoUrl = $container.data("video-url");
        if (!videoUrl) return;
        let html;
        if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
            html = `<video controls autoplay width="100%" style="border-radius:8px;">
                        <source src="${videoUrl}">
                        Tu navegador no soporta el video.
                    </video>`;
        } else {
            html = `<iframe src="${videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen
                     style="width:100%;aspect-ratio:16/9;border-radius:8px;"></iframe>`;
        }
        $container.replaceWith(html);
    });
}


setInterval(() => getRss().then((res) => {
    if (device === "mobile") {
        fillMobileGrid(res)
    } else {
        fillDesktopGrid(res)
    }
    updateLastRequestTimeInFront()
}), 1000 * 60 * minsRefresh)


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
    let image = '<img style="width: 19px; height: 19px; border-radius: 4px;" src="./logos/' + feed.source + 'SmallLogo.svg" alt="" onerror="this.onerror=null;this.src=\'./logos/genericSmallLogo.svg\';" />';

    $(parentElementId).append(`
        <div id="${feed.source + stringMinimalist + i}" class="minimalist-data" style="width: 100%;">
            <span class="news-date">${image} ${new Date(feed.pubDate).toLocaleString()}</span>
            <i class="bi bi-box-arrow-down news-icon" id="${feed.source + stringVerMas + i}"></i>
            <div class="icons-right" id="${feed.source + stringVerMas + i}ShareIcons">
                <a href="https://api.whatsapp.com/send?text=¡Visto en JournoGrid! ${encodeURIComponent(linkToShare)}" target="_blank" class="no-decoration">
                    <img src="./logos/whatsapp.svg" class="news-icon-wats" alt=""/>
                </a>
                <a href="https://t.me/share/url?url=${encodeURIComponent(linkToShare)}&text=¡Visto en JournoGrid!" target="_blank" class="no-decoration">
                    <img src="./logos/telegram.svg" class="news-icon-telegram" alt=""/>
                </a>
            </div>
        </div>
    `);
    }

const images = document.querySelectorAll('.image-container img');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
});

images.forEach((image) => {
    observer.observe(image);
});

