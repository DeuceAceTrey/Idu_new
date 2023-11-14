const clients = document.getElementById('clients');
const emptyState = document.getElementById('emptystate');
const addClientForm = document.getElementById('addClientForm');
const deleteHoleForm = document.getElementById('deleteHoleForm');
const deleteFileForm = document.getElementById('deleteFileForm');
const deleteClientForm = document.getElementById('deleteClientForm');
const deleteContactForm = document.getElementById('deleteContactForm');
const adminClientNameInput = <HTMLInputElement>document.getElementById('clientName');
const adminContactNameInput = <HTMLInputElement>document.getElementById('contactName');
const adminContactEmailInput = <HTMLInputElement>document.getElementById('contactEmail');
const adminContactRoleInput = <HTMLInputElement>document.getElementById('contactRole');

const adminClientIdInput = <HTMLInputElement>document.getElementById('clientIdInput');
if(adminClientIdInput != undefined) {
    const adminClientId = adminClientIdInput.value;
}
const adminHoles = document.querySelectorAll('.hole');
const adminClients = $('.client');
const holeForm = document.getElementById('addHoleForm');
const contactForm = document.getElementById('addContactForm');
const holeNumberInput = document.getElementById('holeNumber');
const adminHoleArrows = document.querySelectorAll(".js-hole-arrow");
const tabItems = document.querySelectorAll(".tabs__item");
let deleteFileBtns = document.querySelectorAll('.js-delete-file');
const deleteClientBtns = document.querySelectorAll('.js-delete-client');
const deleteHoleBtns = document.querySelectorAll('.js-delete-hole');
const deleteContactBtns = document.querySelectorAll('.js-delete-contact');

if(clients) {
    if((clients.offsetHeight + 89) > window.innerHeight) {
        document.querySelector('.clients__footer').classList.add('clients__footer--shadowed')
    }
}

if(addClientForm) {
    addClientForm.addEventListener('submit', function(e) {
        var clientName = adminClientNameInput.value;
        var contactName = adminContactNameInput.value;
        var contactRole = adminContactRoleInput.value;
        var contactEmail = adminContactEmailInput.value;

        var payload = {
            clientName,
            contactName,
            contactRole,
            contactEmail,
        };
        e.preventDefault();
        $.ajax({
            method: "POST",
            url: "/admin/clients/create",
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
    });
}

if(deleteClientForm) {
    deleteClientForm.addEventListener('submit', function(e) {
        const clientId = e.target.dataset.clientId;

        e.preventDefault();
        e.target.classList.add("loading");
        $.ajax({
            method: "DELETE",
            url: "/admin/clients/" + clientId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function() {
                window.location.reload();
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    });
}

// Init Dropzone
Dropzone.autoDiscover = false

const initDropzone = el => {
    let action;
    if(el.action === location.origin + "/public/upload") {
        action = "/public/upload"
    } else if (el.action === location.origin + "/public/upload/zip") {
        action = "/public/upload/zip"
    }
    const acceptedFiles = [
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream',
    ]
    // const holeId = document.getElementById('holeId').value
    const dz = new Dropzone(el, {
        // url: '/public/upload/zip',
        url: action,
        autoProcessQueue: true,
        // acceptedFiles: acceptedFiles.join(', '), // single file allowed now
    })

    dz.on('addedfile', () => console.log('addedfile'))
    dz.on('sending', () => console.log('sending'))
    dz.on('processing', () => console.log('processing'))

    dz.on('queuecomplete', () => {
        console.log('queuecomplete')
        window.location.reload()
    })

    dz.on('success', () => {
        console.log('success')
    })

    dz.on('error', (err) => {
        console.warn('error', err)
    })

    // solve for dropzone.js bug : https://github.com/enyo/dropzone/issues/578
    // if the first file is invalid then do nothing
    // this event has been fired prematurely
    dz.on('complete', () => {
        if (dz.files[0].status === Dropzone.SUCCESS) {
            console.warn('Warning. Possible dropzone issue?')
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const list = <NodeListOf> document.querySelectorAll('.dropzone');
    for (var i = 0, len = list.length; i < len; i++) {
        initDropzone(list[i]);
    }
})

function setFileAsLoaded(i) {
    setTimeout(function() {
        document.querySelector('.file--' + i).classList.remove('file--loading');
    }, 3000);
}

window.Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const filesTemplate = window.Handlebars.compile('<div class="file {{type}}"><div class="file__bar bar"><div class="bar__progress"></div></div><div class="file__wrap">{{#if type}}{{#ifEquals type "application/pdf" }}<i class="file__icon file__icon--pdf">{{/ifEquals}}{{#ifEquals type "application/zip" }}<i class="file__icon file__icon--zip">{{/ifEquals}}{{#ifEquals type "text/plain"}}<i class="file__icon file__icon--text">{{/ifEquals}}{{#ifEquals type "image/jpg" }}<i class="file__icon file__icon--jpg">{{/ifEquals}}{{#ifEquals type "image/jpeg" }}<i class="file__icon file__icon--jpeg">{{/ifEquals}}{{#ifEquals type "image/png" }}<i class="file__icon file__icon--png">{{/ifEquals}}{{#ifEquals type "video/mp4" }}<i class="file__icon file__icon--mp4">{{/ifEquals}}{{#ifEquals type "video/avi" }}<i class="file__icon file__icon--avi">{{/ifEquals}}{{#ifEquals type "video/3gp" }}<i class="file__icon file__icon--3gp">{{/ifEquals}}{{ else }}<i class="file__icon file__icon--las">{{/if}}</i><p class="file__content flat">{{name}}{{#if viewed}}<span class="file__seen" title="Client has seen file"><i class="fal fa-eye"></i></span>{{/if}}</p><div class="file__actions"><div class="file__action"><i class="fal fa-check file__check"></i></div><div class="file__action js-delete-file js-modal-open" data-modal-id="deleteFileModal" data-file-name="{{ name }}" data-file-id="{{ id }}"><i class="fal fa-trash-alt file__delete"></i></div></div></div></div>');

const renderFiles = (files, holeId) => {
    if (files.length) {
        const html = files.map(filesTemplate).join('')
        document.getElementById('filesEl-' + holeId).innerHTML = html
        document.querySelector('.files--' + holeId).classList.add('files--hasfiles')
        attachAllModals()
        // TODO: Refactor - Listen to new delete btns
        deleteFileBtns = document.querySelectorAll('.js-delete-file');
        for (var i = 0, len = deleteFileBtns.length; i < len; i++) {
            deleteFileBtns[i].addEventListener("click", function(e) {
                const fileId = e.currentTarget.dataset.fileId;
                const fileName = e.currentTarget.dataset.fileName;
                e.preventDefault();
                deleteFileForm.setAttribute("data-file-id", fileId);
                document.querySelector(".js-file-name").textContent = fileName;
            });
        }
    } else {
        document.querySelector('.files--' + holeId).classList.add('files--nofiles')
    }
}

const fetchFiles = (clientId, holeId) => {
    return $.ajax({
        method: "GET",
        url: "/api/files?clientId=" + clientId + "&holeId=" + holeId,
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

if(holeForm) {
    holeForm.addEventListener('submit', function(e) {
        var holeNumber = holeNumberInput.value;

        const data = {
            code: holeNumber,
            clientId: adminClientId
        };

        e.preventDefault();
        e.target.classList.add("loading");
        $.ajax({
            method: "POST",
            url: "/api/holes",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        })
            .done(function() {
                window.location.reload();
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    })
}

if (adminContactEmailInput) {
    adminContactEmailInput.addEventListener('blur', (e) => {
        const email = e.target.value
        $.ajax({
            method: 'POST',
            url: '/admin/check-contact-exists',
            data: { email }
        })
            .done(function() {
                document.getElementById('newContactDetails').classList.add('form__optional--hidden')
                document.getElementById('newContactExistsMessage').removeAttribute('hidden')
                document.getElementById('contactName').removeAttribute('required')
                document.getElementById('contactRole').removeAttribute('required')
            })
            .fail(function(ex) {
                document.getElementById('newContactDetails').classList.remove('form__optional--hidden')
                document.getElementById('newContactExistsMessage').setAttribute('hidden', 'hidden')
                document.getElementById('contactName').setAttribute('required', 'required')
                document.getElementById('contactRole').setAttribute('required', 'required')
            });
    })
}

if(contactForm) {
    contactForm.addEventListener("submit", function(e) {
        const contactName = adminContactNameInput.value;
        const contactEmail = adminContactEmailInput.value;
        const contactRole = adminContactRoleInput.value;

        const data = {
            name: contactName,
            role: contactRole,
            email: contactEmail,
            // TODO: Move this to server side
            clientId: adminClientId
        }

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "POST",
            url: "/admin/contacts/create",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        })
            .done(function() {
                window.location = "/admin/client/" + adminClientId + "?tab=contacts"
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    })
}

if(deleteContactForm) {
    deleteContactForm.addEventListener('submit', function(e) {
        const contactId = e.target.dataset.contactId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "POST",
            url: "/admin/remove-client-contact/" + adminClientId + "/" + contactId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function() {
                window.location = "/admin/client/" + adminClientId + "?tab=contacts"
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    });
}

if(deleteHoleForm) {
    deleteHoleForm.addEventListener('submit', function(e) {
        const holeId = e.target.dataset.holeId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/admin/holes/" + holeId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function() {
                window.location = "/admin/client/" + adminClientId + "?tab=contacts"
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    });
}

if(deleteFileForm) {
    deleteFileForm.addEventListener('submit', function(e) {
        const fileId = e.target.dataset.fileId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/api/files/" + fileId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function() {
                window.location = "/admin/client/" + adminClientId
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });
    });
}

if(deleteHoleForm) {
    deleteHoleForm.addEventListener('submit', function(e) {
        const holeId = e.target.dataset.holeId;

        e.preventDefault();
        e.target.classList.add("loading");

        $.ajax({
            method: "DELETE",
            url: "/admin/holes/" + holeId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function() {
                window.location = "/admin/client/" + adminClientId + "?tab=contacts"
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });

    });
}

if(deleteClientBtns) {
    for (var i = 0, len = deleteClientBtns.length; i < len; i++) {
        deleteClientBtns[i].addEventListener("click", function(e) {
            const clientId = e.currentTarget.dataset.clientId;
            const clientName = e.currentTarget.dataset.clientName;
            e.preventDefault();
            deleteClientForm.setAttribute("data-client-id", clientId);
            document.querySelector(".js-client-name").textContent = clientName;
        });
    }
}

if(deleteContactBtns) {
    for (var i = 0, len = deleteContactBtns.length; i < len; i++) {
        deleteContactBtns[i].addEventListener("click", function(e) {
            const contactId = e.currentTarget.dataset.contactId;
            const contactName = e.currentTarget.dataset.contactName;
            e.preventDefault();
            deleteContactForm.setAttribute("data-contact-id", contactId);
            document.querySelector(".js-contact-name").textContent = contactName;
        });
    }
}

if(deleteHoleBtns) {
    for (var i = 0, len = deleteHoleBtns.length; i < len; i++) {
        deleteHoleBtns[i].addEventListener("click", function(e) {
            const holeId = e.currentTarget.dataset.holeId;
            const holeCode = e.currentTarget.dataset.holeCode;
            e.preventDefault();
            deleteHoleForm.setAttribute("data-hole-id", holeId);
            document.querySelector(".js-hole-code").textContent = holeCode;
        });
    }
}

if(deleteFileBtns) {
    for (var i = 0, len = deleteFileBtns.length; i < len; i++) {
        deleteFileBtns[i].addEventListener("click", function(e) {
            const fileId = e.currentTarget.dataset.fileId;
            const fileName = e.currentTarget.dataset.fileName;
            e.preventDefault();
            deleteFileForm.setAttribute("data-file-id", fileId);
            document.querySelector(".js-file-name").textContent = fileName;
        });
    }
}


const openHole = (target) => {
    var holeId = $(target).closest('.hole').data("holeId");
    // If there is an open hole and the target isnt the open one
    if($(target).closest('.hole').hasClass("hole--open")) {
        $(target).closest('.hole').removeClass("hole--open");
    } else {
        $(target).closest('.hole').addClass("hole--open");
        fetchFiles(adminClientId, holeId);
    }
}


for (var i = 0, len = tabItems.length; i < len; i++) {
    tabItems[i].addEventListener("click", function(e) {
        var tabId = e.target.dataset.tabId;
        e.preventDefault();
        document.getElementById("tabs").setAttribute("class", "tabs tabs--" + tabId);
    });
}

for (var i = 0, len = adminHoleArrows.length; i < len; i++) {
    adminHoleArrows[i].addEventListener("click", function(e) {
        e.preventDefault();
        openHole(e.currentTarget);
    });
}

if(adminClients) {
    adminClients.each(function(i, el) {
        const clientId = adminClients[i].dataset.clientId;
        $.ajax({
            method: "GET",
            url: "/api/holes?clientId=" + clientId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .done(function(data) {
                $(el).find(".js-total-holes").text(data.length);
                if(data.length === 1) {
                    $(el).find(".js-total-holes-plural").attr("hidden", ""); }
            })
            .fail(function(ex) {
                console.log('parsing failed: ', ex)
            });

        $.ajax({
            method: "GET",
            url: "/api/get-number-of-contacts?clientId=" + clientId,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .done(function(data) {
            $(el).find(".js-total-contacts").text(data.length);
            $(el).find(".card__meta").css("opacity", 1);
            if(data.length === 1) {
                $(el).find(".js-total-contacts-plural").attr("hidden", "");
            }
        })
        .fail(function(ex) {
            console.log('parsing failed: ', ex)
        });
    })
}
