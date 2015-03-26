delay = 250;
currentPage = 0;
keyHandlerForPage = {};

document.addEventListener('DOMContentLoaded', function() {
    slides = $(".slide");
    slides.eq(currentPage).fadeIn(1000, "swing");
    var usedPageHandler = false;
    nextPageHandler = null;
    turnThePage = function(e) {
        var handler = keyHandlerForPage[slides.eq(currentPage).attr("id")];
        if (nextPageHandler) {
            var toCall = nextPageHandler;
            nextPageHandler = null;
            toCall();
        } else if (!usedPageHandler && handler) {
            usedPageHandler = true;
            handler();
        } else {
            nextPageHandler = null;
            usedPageHandler = false;
            var key = e.keyCode ? e.keyCode : e.which;
            var oldPage = currentPage;
            //if (key == 39) {
                currentPage++;
            // } else if (key == 37 && currentPage > 0) {
            //     currentPage--;
            // }
            if (currentPage != oldPage) {
                slides.eq(oldPage).fadeOut(delay, "swing", function() {
                    slides.eq(currentPage).fadeIn(delay, "swing");
                });
            }
        }
    };

    window.onkeyup = turnThePage;
    window.onclick = turnThePage;
    document.addEventListener('touchstart', turnThePage);
});
