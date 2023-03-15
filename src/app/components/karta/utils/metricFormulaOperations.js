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

export function setFieldValues(id, fieldValue, checkValue) {
    let domElem = document.getElementById('fd' + id);
    if (domElem.innerText.length == 0) {
        domElem.innerText = fieldValue;
        domElem.innerHTML = fieldValue;
        return false;
    }
    else {
        if(checkValue.length > 0){
            domElem.innerText = fieldValue;
            domElem.innerHTML = fieldValue;
            return false;
        }
        else {
            return true;
        }
    }
}

export function calculateFormula(event, suggestionsLength, tempObj, formValidation, formValues, targetValues) {
    let originalValue = event.target.value.trim();
    let newValue = '';
    let value = event.target.value.trim().split(/[\s() */%+-]+/g);
    let total = 0;
    let checkFrag = false;

    value.forEach((y) => {
        if (y && !parseInt(y)) {
            if (tempObj[y] || tempObj[y] == 0) {
                newValue = newValue ? newValue.replace(y, tempObj[y]) : originalValue.replace(y, tempObj[y]);
            } else {
                checkFrag = true;
            }
        }
    });

    if( formValidation && originalValue ) {
        if( checkFrag ) {
            $('#formula-field').addClass('is-invalid');
            $('#formula-field').removeClass('is-valid');
            return {
                data: null,
                message: "Invalid Formula..!!"
            }
        } else {
            newValue = eval(newValue);
            if(!isFinite(newValue)) {
                $('#formula-field').addClass('is-invalid');
                $('#formula-field').removeClass('is-valid');
                return {
                    data: null,
                    message: "Infine value cannot be accepted..!!"
                }
            }
            let newV = newValue.toString().split('.');
            if (parseInt(newV[1]) > 0) newValue = Number(newValue).toFixed(2);
            else newValue = newV[0];
            total = newValue;

            if( total < 0 ) {
                $('#formula-field').addClass('is-invalid');
                $('#formula-field').removeClass('is-valid');
                return {
                    data: null,
                    message: `Achieved value can't be a negative value..!! (${total})`
                }
            } else {
                $('#formula-field').removeClass('is-invalid');
                let request = {
                    ...formValues,
                    metrics: true,
                };
                delete request['calculatedValue'];
    
                let newTarget = targetValues.map((obj) => {
                    let percentage = (total / obj.value) * 100;
                    return {
                    ...obj,
                    percentage: Math.round(percentage),
                    value: obj.value
                    }
                });

                return {
                    data: [total, newTarget, request],
                    message: "Calculation completed..!!"
                }
            }
        }
    }
}

export function filterFieldSuggestions(event) {
    $('#formula-field').removeClass('is-invalid');
    $('#formula-field').removeClass('is-valid');
    let value = event.target.value.trim().toLowerCase();
    let mathOperators = ['+', '-', '/', '*', '(', ')', '%'];
    let findLastIndex = null;

    for (let i = value.length - 1; i >= 0; i--) {
      if (mathOperators.includes(value[i])) {
        findLastIndex = value.lastIndexOf(value[i]);
        break;
      }
    }

    if (!value) {
      return [];
    }

    if (findLastIndex != -1 || findLastIndex) {
        let replaceValue = value.slice(findLastIndex + 1, value.length).trim();
        if (replaceValue) {
            return replaceValue.trim();
        } else {
            return [];
        }
    } else {
        return value.trim();
    }
}

export function concatenateFieldValue(data) {
    let addValue = data.fieldName.trim();
    let inputValue = document.getElementById('formula-field');
    let mathOperators = ['+', '-', '/', '*', '(', ')', '%'];
    let findLastIndex = -1;

    for (let i = inputValue.value.length; i > 0; i--) {
      if (mathOperators.includes(inputValue.value[i])) {
        findLastIndex = inputValue.value.lastIndexOf(inputValue.value[i]);
        break;
      }
    }

    if (findLastIndex != -1) {
      let concatValue = inputValue.value.slice(0, findLastIndex + 1).trim();
      let finalString = concatValue + addValue;
      inputValue.value = finalString;
      inputValue.focus();
      return finalString;
    } else {
      inputValue.value = addValue;
      inputValue.focus();
      return addValue;
    }
}