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

function updateLastRequestTimeInFront() {
    lastRequestTimeMilis = Date.now()
    $("#lastUpdate").html("Última actualización: " + new Date(lastRequestTimeMilis).toLocaleString())
}
