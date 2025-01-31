$(document).ready(function () {
    $("#searchButton").click(function () {
        const searchTerm = $("#searchInput").val();
        filterNews(searchTerm);
    });

    $("#searchInput").keypress(function (event) {
        if (event.which === 13) {
            $("#searchButton").click();
            event.preventDefault();
        }
    });
    $("#searchInput").on("input", function () {
        if ($(this).val() === "") {
            showAllNews();
        }
    });
})

function filterNews(searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();

    $(".news-item, .news-item-mobile").each(function () {
        const title = $(this).find(".news-title").text().toLowerCase();
        const description = $(this).find(".news-desciption").text().toLowerCase();

        const matchFound = title.includes(searchTermLower) || description.includes(searchTermLower);
        $(this).toggle(matchFound);
    });

    updateNewsContainerVisibility();
}

function showAllNews() {
    const divs = document.querySelectorAll('[name="newsColumn"]');

    divs.forEach(div => {
        div.style.display = 'block';
    });

    $(".news-item, .news-item-mobile").show();

    updateNewsContainerVisibility();
}

function updateNewsContainerVisibility() {
    $("[class*='news-container']").each(function () {
        const $container = $(this);
        const $parent = $container.closest("li");
        const newsItemsCount = $container.find(".news-item:visible, .news-item-mobile:visible").length;

        if (newsItemsCount === 0) {
            $parent.hide();
        } else {
            $parent.show();
        }
    });
}