export function editFieldStatus(id, value, fieldName) {
    let dom = document.getElementById('fd' + id);
    dom.innerHTML = fieldName;
    dom.innerText = fieldName;
    $('#fd' + id).attr('contenteditable', value);
    $('#fd' + id).focus();
    return dom;
}

export function checkFieldStatus(id) {
    let element = document.getElementById(id);
    if (element) {
        return JSON.parse(element.contentEditable);
    }
    return false;
}

export function recheckFormula() {
    if ($('#formula-field').val()) {
        $('#formula-field').focus();
        $('#formula-field').blur();
    }
}