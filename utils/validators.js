/**
 * JavaScript Validators v 0.1.0
 * (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.
 */


/*******************
 * YYYY-MM-DD date *
 *******************/

function validDate(dateString) {
    if (dateString.length !== 10) {
        return false;
    }

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(5, 7), 10);
    const day = parseInt(dateString.substring(8, 10), 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return false;
    }

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) {
        return false;
    }

    return true;
}
