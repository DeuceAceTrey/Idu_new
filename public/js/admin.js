var clients = document.getElementById("clients");
var emptyState = document.getElementById("emptystate");
var addClientForm = document.getElementById("addClientForm");
var deleteHoleForm = document.getElementById("deleteHoleForm");
var deleteFileForm = document.getElementById("deleteFileForm");
var deleteClientForm = document.getElementById("deleteClientForm");
var deleteContactForm = document.getElementById("deleteContactForm");

var adminClientNameInput = document.getElementById("clientName");
var adminContactNameInput = document.getElementById("contactName");
var adminContactEmailInput = document.getElementById("contactEmail");
var adminContactRoleInput = document.getElementById("contactRole");
var adminClientIdInput = document.getElementById("clientIdInput");

if (adminClientIdInput != undefined) {
    var adminClientId = adminClientIdInput.value;
}
var adminHoles = document.querySelectorAll(".hole");
var adminClients = $(".client");
var holeForm = document.getElementById("addHoleForm");
var contactForm = document.getElementById("addContactForm");
var holeNumberInput = document.getElementById("holeNumber");
var adminHoleArrows = document.querySelectorAll(".js-hole-arrow");
var tabItems = document.querySelectorAll(".tabs__item");
var deleteFileBtns = document.querySelectorAll(".js-delete-file");
var deleteClientBtns = document.querySelectorAll(".js-delete-client");
var deleteHoleBtns = document.querySelectorAll(".js-delete-hole");
var deleteContactBtns = document.querySelectorAll(".js-delete-contact");

if (clients) {
    if (clients.offsetHeight + 89 > window.innerHeight) {
        document
            .querySelector(".clients__footer")
            .classList.add("clients__footer--shadowed");
    }
}

if (addClientForm) {
    addClientForm.addEventListener("submit", function (e) {
        var clientName = adminClientNameInput.value;
        var contactName = adminContactNameInput.value;
        var contactRole = adminContactRoleInput.value;
        var contactEmail = adminContactEmailInput.value;

        var payload = {
            clientName: clientName,
            contactName: contactName,
            contactRole: contactRole,
            contactEmail: contactEmail,
        };

        e.preventDefault();

        $.ajax({
            method: "POST",
            url: "/admin/clients/create",
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
    });
}

if (deleteClientForm) {
    deleteClientForm.addEventListener("submit", function (e) {
        var clientId = e.target.dataset.clientId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/admin/clients/" + clientId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function () {
                window.location.reload();
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

// Init Dropzone
Dropzone.autoDiscover = false;

var initDropzone = function (el) {
    var action;
    if (el.action === location.origin + "/public/upload") {
        action = "/public/upload";
    } else if (el.action === location.origin + "/public/upload/zip") {
        action = "/public/upload/zip";
    }

    var acceptedFiles = [
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
    ];

    // const holeId = document.getElementById('holeId').value
    var dz = new Dropzone(el, {
        // url: '/public/upload/zip',
        url: action,
        autoProcessQueue: true,
    });

    dz.on("addedfile", function () {
        return console.log("addedfile");
    });
    dz.on("sending", function () {
        return console.log("sending");
    });
    dz.on("processing", function () {
        return console.log("processing");
    });
    dz.on("queuecomplete", function () {
        console.log("queuecomplete");
        window.location.reload();
    });
    dz.on("success", function () {
        console.log("success");
    });
    dz.on("error", function (err) {
        console.warn("error", err);
    });
    // solve for dropzone.js bug : https://github.com/enyo/dropzone/issues/578
    // if the first file is invalid then do nothing
    // this event has been fired prematurely
    dz.on("complete", function () {
        if (dz.files[0].status === Dropzone.SUCCESS) {
            console.warn("Warning. Possible dropzone issue?");
        }
    });
};

document.addEventListener("DOMContentLoaded", function () {
    var list = document.querySelectorAll(".dropzone");
    for (var i = 0, len = list.length; i < len; i++) {
        initDropzone(list[i]);
    }
});

function setFileAsLoaded(i) {
    setTimeout(function () {
        document.querySelector(".file--" + i).classList.remove("file--loading");
    }, 3000);
}

window.Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

var filesTemplate = window.Handlebars.compile(
    '<div class="file {{type}}"><div class="file__bar bar"><div class="bar__progress"></div></div><div class="file__wrap">{{#if type}}{{#ifEquals type "application/pdf" }}<i class="file__icon file__icon--pdf">{{/ifEquals}}{{#ifEquals type "application/zip" }}<i class="file__icon file__icon--zip">{{/ifEquals}}{{#ifEquals type "text/plain"}}<i class="file__icon file__icon--text">{{/ifEquals}}{{#ifEquals type "image/jpg" }}<i class="file__icon file__icon--jpg">{{/ifEquals}}{{#ifEquals type "image/jpeg" }}<i class="file__icon file__icon--jpeg">{{/ifEquals}}{{#ifEquals type "image/png" }}<i class="file__icon file__icon--png">{{/ifEquals}}{{#ifEquals type "video/mp4" }}<i class="file__icon file__icon--mp4">{{/ifEquals}}{{#ifEquals type "video/avi" }}<i class="file__icon file__icon--avi">{{/ifEquals}}{{#ifEquals type "video/3gp" }}<i class="file__icon file__icon--3gp">{{/ifEquals}}{{ else }}<i class="file__icon file__icon--las">{{/if}}</i><p class="file__content flat">{{name}}{{#if viewed}}<span class="file__seen" title="Client has seen file"><i class="fal fa-eye"></i></span>{{/if}}</p><div class="file__actions"><div class="file__action"><i class="fal fa-check file__check"></i></div><div class="file__action js-delete-file js-modal-open" data-modal-id="deleteFileModal" data-file-name="{{ name }}" data-file-id="{{ id }}"><i class="fal fa-trash-alt file__delete"></i></div></div></div></div>'
);

var renderFiles = function (files, holeId) {
    if (files.length) {
        var html = files.map(filesTemplate).join("");
        document.getElementById("filesEl-" + holeId).innerHTML = html;
        document
            .querySelector(".files--" + holeId)
            .classList.add("files--hasfiles");
        attachAllModals();
        // TODO: Refactor - Listen to new delete btns
        deleteFileBtns = document.querySelectorAll(".js-delete-file");

        for (var i = 0, len = deleteFileBtns.length; i < len; i++) {
            deleteFileBtns[i].addEventListener("click", function (e) {
                var fileId = e.currentTarget.dataset.fileId;
                var fileName = e.currentTarget.dataset.fileName;
                e.preventDefault();
                deleteFileForm.setAttribute("data-file-id", fileId);
                document.querySelector(".js-file-name").textContent = fileName;
            });
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
        url: "/api/files?clientId=" + clientId + "&holeId=" + holeId,
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

if (holeForm) {
    holeForm.addEventListener("submit", function (e) {
        var holeNumber = holeNumberInput.value;

        var data = {
            code: holeNumber,
            clientId: adminClientId,
        };

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "POST",
            url: "/api/holes",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
        })
            .done(function () {
                window.location.reload();
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

if (adminContactEmailInput) {
    adminContactEmailInput.addEventListener("blur", function (e) {
        var email = e.target.value;

        $.ajax({
            method: "POST",
            url: "/admin/check-contact-exists",
            data: { email: email },
        })
            .done(function () {
                document
                    .getElementById("newContactDetails")
                    .classList.add("form__optional--hidden");
                document
                    .getElementById("newContactExistsMessage")
                    .removeAttribute("hidden");
                document
                    .getElementById("contactName")
                    .removeAttribute("required");
                document
                    .getElementById("contactRole")
                    .removeAttribute("required");
            })
            .fail(function (ex) {
                document
                    .getElementById("newContactDetails")
                    .classList.remove("form__optional--hidden");
                document
                    .getElementById("newContactExistsMessage")
                    .setAttribute("hidden", "hidden");
                document
                    .getElementById("contactName")
                    .setAttribute("required", "required");
                document
                    .getElementById("contactRole")
                    .setAttribute("required", "required");
            });
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        var contactName = adminContactNameInput.value;
        var contactEmail = adminContactEmailInput.value;
        var contactRole = adminContactRoleInput.value;

        var data = {
            name: contactName,
            role: contactRole,
            email: contactEmail,
            // TODO: Move this to server side
            clientId: adminClientId,
        };

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "POST",
            url: "/admin/contacts/create",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
        })
            .done(function () {
                window.location =
                    "/admin/client/" + adminClientId + "?tab=contacts";
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

if (deleteContactForm) {
    deleteContactForm.addEventListener("submit", function (e) {
        var contactId = e.target.dataset.contactId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "POST",
            url:
                "/admin/remove-client-contact/" +
                adminClientId +
                "/" +
                contactId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function () {
                window.location =
                    "/admin/client/" + adminClientId + "?tab=contacts";
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

if (deleteHoleForm) {
    deleteHoleForm.addEventListener("submit", function (e) {
        var holeId = e.target.dataset.holeId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/admin/holes/" + holeId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function () {
                window.location =
                    "/admin/client/" + adminClientId + "?tab=contacts";
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

$(".uploadBtn").on("click", function () {
    var id = $(this).attr("uid");
    $("#uploadFile_" + id).click();

    var element = $("#uploading_" + id);
    element.removeClass("loading_hide").addClass("loading_show");
});

$(".uploadFile").on("change", function (e) {
    e.preventDefault();

    var id = $(this).attr("uid");

    if (e.target.files[0]) {
        var holeId = id;

        var file_name = e.target.files[0].name;

        var file_type = e.target.files[0].type;
        const segments = file_type.split("/");
        var file_category = segments[0] + "." + segments[1];

        var file_size = e.target.files[0].size;

        var formData = new FormData();
        formData.append("file", e.target.files[0]);

        $.ajax({
            url:
                "/upload/" +
                holeId +
                "/" +
                file_name +
                "/" +
                file_category +
                "/" +
                file_size,
            method: "POST",
            dataType: "json",
            data: formData,
            success: function (data) {
                var element = $("#uploading_" + id);
                element.removeClass("loading_show").addClass("loading_hide");

                alert(data);
            },
            error: function (err) {
                console.log(err);
            },
            processData: false,
            contentType: false,
            async: false,
        });
    }
});

// document.getElementById('upload_file2').addEventListener('change', function(e) {
//     if (e.target.files[0]) {
//         alert("hey")
//         var holeId = upload_holeId2.value;
//         var file = upload_file2.files[0];

//         var file_size=upload_file2.files[0].size

//         var payload = {
//             holeId,
//             file,
//             file_size
//         };

//         e.preventDefault();

//         $.ajax({
//             method: "POST",
//             url: "/public/upload",
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             data: JSON.stringify(payload)
//         })
//         .done(function (data) {
//             alert(data);
//         })
//         .fail(function (ex) {
//             console.log('parsing failed: ', ex);
//         });
//     }
// })

if (deleteFileForm) {
    deleteFileForm.addEventListener("submit", function (e) {
        var fileId = e.target.dataset.fileId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/api/files/" + fileId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function () {
                window.location = "/admin/client/" + adminClientId;
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

if (deleteHoleForm) {
    deleteHoleForm.addEventListener("submit", function (e) {
        var holeId = e.target.dataset.holeId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/admin/holes/" + holeId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function () {
                window.location =
                    "/admin/client/" + adminClientId + "?tab=contacts";
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}

if (deleteClientBtns) {
    for (var i = 0, len = deleteClientBtns.length; i < len; i++) {
        deleteClientBtns[i].addEventListener("click", function (e) {
            var clientId = e.currentTarget.dataset.clientId;
            var clientName = e.currentTarget.dataset.clientName;

            e.preventDefault();

            deleteClientForm.setAttribute("data-client-id", clientId);
            document.querySelector(".js-client-name").textContent = clientName;
        });
    }
}

if (deleteContactBtns) {
    for (var i = 0, len = deleteContactBtns.length; i < len; i++) {
        deleteContactBtns[i].addEventListener("click", function (e) {
            var contactId = e.currentTarget.dataset.contactId;
            var contactName = e.currentTarget.dataset.contactName;

            e.preventDefault();

            deleteContactForm.setAttribute("data-contact-id", contactId);
            document.querySelector(".js-contact-name").textContent =
                contactName;
        });
    }
}

if (deleteHoleBtns) {
    for (var i = 0, len = deleteHoleBtns.length; i < len; i++) {
        deleteHoleBtns[i].addEventListener("click", function (e) {
            var holeId = e.currentTarget.dataset.holeId;
            var holeCode = e.currentTarget.dataset.holeCode;

            e.preventDefault();

            deleteHoleForm.setAttribute("data-hole-id", holeId);
            document.querySelector(".js-hole-code").textContent = holeCode;
        });
    }
}

if (deleteFileBtns) {
    for (var i = 0, len = deleteFileBtns.length; i < len; i++) {
        deleteFileBtns[i].addEventListener("click", function (e) {
            var fileId = e.currentTarget.dataset.fileId;
            var fileName = e.currentTarget.dataset.fileName;

            e.preventDefault();

            deleteFileForm.setAttribute("data-file-id", fileId);
            document.querySelector(".js-file-name").textContent = fileName;
        });
    }
}

var openHole = function (target) {
    var holeId = $(target).closest(".hole").data("holeId");
    // If there is an open hole and the target isnt the open one
    if ($(target).closest(".hole").hasClass("hole--open")) {
        $(target).closest(".hole").removeClass("hole--open");
    } else {
        $(target).closest(".hole").addClass("hole--open");
        fetchFiles(adminClientId, holeId);
    }
};

for (var i = 0, len = tabItems.length; i < len; i++) {
    tabItems[i].addEventListener("click", function (e) {
        var tabId = e.target.dataset.tabId;
        e.preventDefault();
        document
            .getElementById("tabs")
            .setAttribute("class", "tabs tabs--" + tabId);
    });
}

for (var i = 0, len = adminHoleArrows.length; i < len; i++) {
    adminHoleArrows[i].addEventListener("click", function (e) {
        e.preventDefault();
        openHole(e.currentTarget);
    });
}

if (adminClients) {
    adminClients.each(function (i, el) {
        var clientId = adminClients[i].dataset.clientId;

        $.ajax({
            method: "GET",
            url: "/api/holes?clientId=" + clientId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function (data) {
                $(el).find(".js-total-holes").text(data.length);
                if (data.length === 1) {
                    $(el).find(".js-total-holes-plural").attr("hidden", "");
                }
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });

        $.ajax({
            method: "GET",
            url: "/api/get-number-of-contacts?clientId=" + clientId,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .done(function (data) {
                $(el).find(".js-total-contacts").text(data.length);
                $(el).find(".card__meta").css("opacity", 1);
                if (data.length === 1) {
                    $(el).find(".js-total-contacts-plural").attr("hidden", "");
                }
            })
            .fail(function (ex) {
                console.log("parsing failed: ", ex);
            });
    });
}
