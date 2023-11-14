var menuBtn = document.getElementById("menuBtn");
var sidebarBg = document.getElementById("sidebarBg");
var timestamps = document.querySelectorAll(".timestamp");
var modalOpeners = document.querySelectorAll(".js-modal-open");
var modalClosers = document.querySelectorAll(".js-modal-close");
var modals = document.querySelectorAll(".modal");
function toggleSidebar() {
    document.querySelector("body").classList.toggle("sidebar-open");
}
function openModal(modal) {
    document.getElementById(modal).removeAttribute("hidden");
    document.querySelector("body").classList.add("modal-open");
}
function closeModal(modal) {
    document.querySelector("body").classList.remove("modal-open");
    document.getElementById(modal).setAttribute("hidden", "");
}
menuBtn.addEventListener("click", function (e) {
    e.preventDefault();
    toggleSidebar();
});
sidebarBg.addEventListener("click", function (e) {
    e.preventDefault();
    toggleSidebar();
});
for (var i = 0, len = timestamps.length; i < len; i++) {
    var time = timestamps[i].dataset.timestamp;
    timestamps[i].innerHTML = moment(time).fromNow();
    timestamps[i].style.opacity = 1;
}
for (var i = 0, len = modals.length; i < len; i++) {
    modals[i].addEventListener("click", function (e) {
        var modal = e.currentTarget.id;
        closeModal(modal);
    });
    modals[i]
        .querySelector(".modal__body")
        .addEventListener("click", function (e) {
            e.stopPropagation();
        });
}
for (var i = 0, len = modalOpeners.length; i < len; i++) {
    modalOpeners[i].addEventListener("click", function (e) {
        e.preventDefault();
        var modal = e.currentTarget.dataset.modalId;
        openModal(modal);
    });
}
for (var i = 0, len = modalClosers.length; i < len; i++) {
    modalClosers[i].addEventListener("click", function (e) {
        e.preventDefault();
        var modal = e.currentTarget.dataset.modalId;
        closeModal(modal);
    });
}
var attachAllModals = function (el) {
    modalOpeners = document.querySelectorAll(".js-modal-open");
    modalClosers = document.querySelectorAll(".js-modal-close");
    modals = document.querySelectorAll(".modal");
    for (var i = 0, len = modals.length; i < len; i++) {
        modals[i].addEventListener("click", function (e) {
            var modal = e.currentTarget.id;
            closeModal(modal);
        });
        modals[i]
            .querySelector(".modal__body")
            .addEventListener("click", function (e) {
                e.stopPropagation();
            });
    }
    for (var i = 0, len = modalOpeners.length; i < len; i++) {
        modalOpeners[i].addEventListener("click", function (e) {
            e.preventDefault();
            var modal = e.currentTarget.dataset.modalId;
            openModal(modal);
        });
    }
    for (var i = 0, len = modalClosers.length; i < len; i++) {
        modalClosers[i].addEventListener("click", function (e) {
            e.preventDefault();
            var modal = e.currentTarget.dataset.modalId;
            closeModal(modal);
        });
    }
};
var attachTimestamps = function (el) {
    timestamps = document.querySelectorAll(".timestamp");
    for (var i = 0, len = timestamps.length; i < len; i++) {
        var time = timestamps[i].dataset.timestamp;
        timestamps[i].innerHTML = moment(time).fromNow();
        timestamps[i].style.opacity = 1;
    }
};
