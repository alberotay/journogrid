let lastResponse
let lastRequestTimeMilis = Date.now()
let allCategories = []
let minsRefresh = 5
let device


async function getRss() {
    let fetched = await fetch('/api/rss?lastView=' + lastRequestTimeMilis);
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
            const $img = $(`<img style="width: 100%;" src="${t.frontEndImage}" alt="${t.source}Logo" />`);
            const $moveUpButton = $(`<button title="Primera noticia" id ="${t.source}MoveUpButton" class="btn btn-default"><span class="bi bi-arrow-up""></span></button>`);
            const $moveDownButton = $(`<button title="Automático" id ="${t.source}MoveDownButton"  class="btn btn-default bi bi-chevron-double-down"" />`);
            const $moveContainerButton = $(`<button type="button" title="Arrastra el contenedor" class="btn btn-default" /><span class="bi bi-arrows-move""></span></button>`);


            $h1.append($img).append($moveUpButton).append($moveDownButton).append($moveContainerButton);
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

function fillDesktopGrid(res) {
    res = sortColumnsByLastPreference(res)
    res.forEach((y) => {
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
                $('#' + source + 'NewsImageContainer_' + j).append('<img id ="' + source + '_thumbNail_' + j + '" loading="lazy" src="' + feed.thumbnailUrl + '"  class= "news-image" />');
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
        if (Date.parse(data.pubDate) > now - 1000 * 60 * 60 * acceptNewsFromHoursBefore) {
            $("#bodyMobile").append('<div id ="rowMobile' + i + '"  value = "' + data.category + 'Mobile" class = "news-item-mobile"/>')
            $("#rowMobile" + i).append('<div class="col-8"><p />' + data.category.replaceAll("_", " ") + '</div>')
                .append('<a href= "' + data.link + '"  class = "news-title" target="blank" href = "' + data.link + '" />' + data.title)
                .append('<img src="' + data.thumbnailUrl + '" loading="lazy" class= "news-image marginTopMobileImage" />')
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

