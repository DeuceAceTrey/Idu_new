var holes = document.querySelectorAll(".hole");
var modal = document.getElementById("modal");
var sendMessageForm = document.getElementById("sendMessageForm");
var sendMessageFileId = document.getElementById("sendMessageFileId");
var sendMessageText = document.getElementById("sendMessageText");
var sendMessageBtns = document.querySelectorAll(".js-send-message");
var holeArrows = document.querySelectorAll(".js-hole-arrow");
var clientIdInput = document.getElementById("clientId");
var clientId = clientIdInput.value;
window.Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
// var filesTemplate = window.Handlebars.compile(' <div class="file file--spaced"> <div class="file__wrap">{{#if type}}{{#ifEquals type "application/zip" }}<i class="file__icon file__icon--zip">{{/ifEquals}}{{#ifEquals type "application/pdf" }}<i class="file__icon file__icon--pdf">{{/ifEquals}}{{#ifEquals type "text/plain"}}<i class="file__icon file__icon--text">{{/ifEquals}}{{#ifEquals type "image/jpg" }}<i class="file__icon file__icon--jpg">{{/ifEquals}}{{#ifEquals type "image/jpeg" }}<i class="file__icon file__icon--jpeg">{{/ifEquals}}{{#ifEquals type "image/png" }}<i class="file__icon file__icon--png">{{/ifEquals}}{{#ifEquals type "video/mp4" }}<i class="file__icon file__icon--mp4">{{/ifEquals}}{{#ifEquals type "video/avi" }}<i class="file__icon file__icon--avi">{{/ifEquals}}{{#ifEquals type "video/3gp" }}<i class="file__icon file__icon--3gp">{{/ifEquals}}{{ else }}<i class="file__icon file__icon--las">{{/if}}</i> <div class="file__content flex--spaced flat"> <div class="file__name">{{name}}<br><small class="file__date">Uploaded <span class="timestamp" data-timestamp="{{ updatedAt }}"></span></small></div> <div class="flex flex--aligned"><div class="file__message js-send-message js-modal-open" data-modal-id="modal" data-file-name="{{ name }}" data-file-id="{{ id }}"> <i class="fal fa-comment"></i> <small>Send message</small> </div><a href="/downloads/{{ holeId }}/{{ name }}" class="file__message" download><i class="fal fa-cloud-download"></i><small>Download</small></a> </div> </div> </div> </div>');
var filesTemplate = window.Handlebars.compile(
    ' <div class="file file--spaced"> <div class="file__wrap">{{#if type}}{{#ifEquals type "application/zip" }}<i class="file__icon file__icon--zip">{{/ifEquals}}{{#ifEquals type "application/pdf" }}<i class="file__icon file__icon--pdf">{{/ifEquals}}{{#ifEquals type "text/plain"}}<i class="file__icon file__icon--text">{{/ifEquals}}{{#ifEquals type "image/jpg" }}<i class="file__icon file__icon--jpg">{{/ifEquals}}{{#ifEquals type "image/jpeg" }}<i class="file__icon file__icon--jpeg">{{/ifEquals}}{{#ifEquals type "image/png" }}<i class="file__icon file__icon--png">{{/ifEquals}}{{#ifEquals type "video/mp4" }}<i class="file__icon file__icon--mp4">{{/ifEquals}}{{#ifEquals type "video/avi" }}<i class="file__icon file__icon--avi">{{/ifEquals}}{{#ifEquals type "video/3gp" }}<i class="file__icon file__icon--3gp">{{/ifEquals}}{{ else }}<i class="file__icon file__icon--las">{{/if}}</i> <div class="file__content flex--spaced flat"> <div class="file__name">{{name}}<br><small class="file__date">Uploaded <span class="timestamp" data-timestamp="{{ updatedAt }}"></span></small></div> <div class="flex flex--aligned"><div class="file__message js-send-message js-modal-open" data-modal-id="modal" data-file-name="{{ name }}" data-file-id="{{ id }}"> <i class="fal fa-comment"></i> <small>Send message</small> </div><span onclick="fileDownload(`{{holeId}}`, `{{name}}`)" class="file__message" download><i class="fal fa-cloud-download"></i><small>Download</small></span> </div> </div> </div> </div>'
);
var fileDownload = function (holeId, name) {
    var element = $("#downloading_" + holeId);
    element.removeClass("loading_hide").addClass("loading_show");

    var payload = {
        holeId,
        name,
    };
    $.ajax({
        type: "POST",
        url: "/download",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: JSON.stringify(payload),
        success: function (data) {
            // const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            link.href = data;
            link.setAttribute("download", name);
            document.body.appendChild(link);
            link.click();
            link.remove();

            element.removeClass("loading_show").addClass("loading_hide");

            alert("The file has been downloaded successfully.");
        },
    });
};
var renderFiles = function (files, holeId) {
    if (files.length) {
        var html = files.map(filesTemplate).join("");
        document.getElementById("filesEl-" + holeId).innerHTML = html;
        document
            .querySelector(".files--" + holeId)
            .classList.add("files--hasfiles");
        document.querySelector(".js-file-count").innnerHTML = files.length;
        attachAllModals();
        attachTimestamps();
        attachMessageBtnListeners();
        var timestamps_1 = document.querySelectorAll(".timestamp");
        for (var i = 0, len = timestamps_1.length; i < len; i++) {
            var time = timestamps_1[i].dataset.timestamp;
            timestamps_1[i].innerHTML = moment(time).startOf("day").fromNow();
        }
    } else {
        document
            .querySelector(".files--" + holeId)
            .classList.add("files--nofiles");
    }
};
var fetchFiles = function (clientId, holeId) {
    return $.ajax({
        method: "GET",
        url: "/client/api/holes/" + holeId,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .done(function (data) {
            renderFiles(data, holeId);
        })
        .fail(function (ex) {
            console.log("parsing failed: ", ex);
        });
};
var openHole = function (target) {
    var holeId = $(target).closest(".hole").data("holeId");
    // If there is an open hole and the target isnt the open one
    if ($(target).closest(".hole").hasClass("hole--open")) {
        $(target).closest(".hole").removeClass("hole--open");
    } else {
        $(target).closest(".hole").addClass("hole--open");
        fetchFiles(clientId, holeId);
    }
};
for (var i = 0, len = holeArrows.length; i < len; i++) {
    holeArrows[i].addEventListener("click", function (e) {
        e.preventDefault();
        openHole(e.currentTarget);
    });
}
var attachMessageBtnListeners = function (el) {
    sendMessageBtns = document.querySelectorAll(".js-send-message");
    for (var i = 0, len = sendMessageBtns.length; i < len; i++) {
        sendMessageBtns[i].addEventListener("click", function (e) {
            var fileId = e.currentTarget.dataset.fileId;
            var fileName = e.currentTarget.dataset.fileName;
            e.preventDefault();
            document.getElementById("sendMessageFileId").value = fileId;
            document.getElementById("fileName").value = fileName;
        });
    }
};
var messageAdmin = function (message, fileId) {
    var payload = {
        message: message,
        fileId: fileId,
    };
    $.ajax({
        method: "POST",
        url: "/client/send-message",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: JSON.stringify(payload),
    })
        .done(function () {
            window.location.reload();
        })
        .fail(function (ex) {
            console.log("parsing failed: ", ex);
        });
};
sendMessageForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var message = sendMessageText.value;
    var fileId = sendMessageFileId.value;
    messageAdmin(message, fileId);
});
