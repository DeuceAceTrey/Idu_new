const holes = document.querySelectorAll('.hole');
const modal = document.getElementById("modal");
const sendMessageForm = document.getElementById("sendMessageForm");
const sendMessageFileId = <HTMLInputElement>document.getElementById("sendMessageFileId");
const sendMessageText = <HTMLInputElement>document.getElementById("sendMessageText");
let sendMessageBtns = document.querySelectorAll('.js-send-message');
const holeArrows = document.querySelectorAll(".js-hole-arrow");
const clientIdInput = <HTMLInputElement>document.getElementById('clientId');
const clientId = clientIdInput.value;

window.Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const filesTemplate = window.Handlebars.compile(' <div class="file file--spaced"> <div class="file__wrap">{{#if type}}{{#ifEquals type "application/zip" }}<i class="file__icon file__icon--zip">{{/ifEquals}}{{#ifEquals type "application/pdf" }}<i class="file__icon file__icon--pdf">{{/ifEquals}}{{#ifEquals type "text/plain"}}<i class="file__icon file__icon--text">{{/ifEquals}}{{#ifEquals type "image/jpg" }}<i class="file__icon file__icon--jpg">{{/ifEquals}}{{#ifEquals type "image/jpeg" }}<i class="file__icon file__icon--jpeg">{{/ifEquals}}{{#ifEquals type "image/png" }}<i class="file__icon file__icon--png">{{/ifEquals}}{{#ifEquals type "video/mp4" }}<i class="file__icon file__icon--mp4">{{/ifEquals}}{{#ifEquals type "video/avi" }}<i class="file__icon file__icon--avi">{{/ifEquals}}{{#ifEquals type "video/3gp" }}<i class="file__icon file__icon--3gp">{{/ifEquals}}{{ else }}<i class="file__icon file__icon--las">{{/if}}</i> <div class="file__content flex--spaced flat"> <div class="file__name">{{name}}<br><small class="file__date">Uploaded <span class="timestamp" data-timestamp="{{ updatedAt }}"></span></small></div> <div class="flex flex--aligned"><div class="file__message js-send-message js-modal-open" data-modal-id="modal" data-file-name="{{ name }}" data-file-id="{{ id }}"> <i class="fal fa-comment"></i> <small>Send message</small> </div><a href="/download/{{ holeId }}/{{ name }}" class="file__message" download><i class="fal fa-cloud-download"></i><small>Download</small></a> </div> </div> </div> </div>');
const renderFiles = (files, holeId) => {
    if(files.length) {
        const html = files.map(filesTemplate).join('')
        document.getElementById('filesEl-' + holeId).innerHTML = html
        document.querySelector('.files--' + holeId).classList.add('files--hasfiles')

        document.querySelector(".js-file-count").innnerHTML = files.length;
        attachAllModals()
        attachTimestamps()
        attachMessageBtnListeners()

        const timestamps = document.querySelectorAll(".timestamp");
        for (var i = 0, len = timestamps.length; i < len; i++) {
            const time = timestamps[i].dataset.timestamp;
            timestamps[i].innerHTML = moment(time).startOf('day').fromNow();
        }
    } else {
        document.querySelector('.files--' + holeId).classList.add('files--nofiles')
    }
}


const fetchFiles = (clientId, holeId) => {
    return $.ajax({
        method: "GET",
            url: "/client/api/holes/" + holeId,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .done(function(data) {
        renderFiles(data, holeId)
    })
    .fail(function(ex) {
        console.log('parsing failed: ', ex)
    });
}

const openHole = (target) => {
    var holeId = $(target).closest('.hole').data("holeId");
    // If there is an open hole and the target isnt the open one
    if($(target).closest('.hole').hasClass("hole--open")) {
        $(target).closest('.hole').removeClass("hole--open");
    } else {
        $(target).closest('.hole').addClass("hole--open");
        fetchFiles(clientId, holeId);
    }
}

for (var i = 0, len = holeArrows.length; i < len; i++) {
    holeArrows[i].addEventListener("click", function(e) {
        e.preventDefault();
        openHole(e.currentTarget);
    });
}

const attachMessageBtnListeners = el => {
    sendMessageBtns = document.querySelectorAll('.js-send-message');

    for (var i = 0, len = sendMessageBtns.length; i < len; i++) {
        sendMessageBtns[i].addEventListener("click", function(e) {
            const fileId = e.currentTarget.dataset.fileId;
            const fileName = e.currentTarget.dataset.fileName;
            e.preventDefault();
            document.getElementById("sendMessageFileId").value = fileId;
            document.getElementById("fileName").value = fileName;
        });
    }
}

const messageAdmin = (message, fileId) => {
    const payload = {
        message,
        fileId
    }

    $.ajax({
        method: "POST",
        url: "/client/send-message",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(payload)
    })
    .done(function() {
        window.location.reload();
    })
    .fail(function(ex) {
        console.log('parsing failed: ', ex)
    });

}

sendMessageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = sendMessageText.value;
    const fileId = sendMessageFileId.value;
    messageAdmin(message, fileId);
});
