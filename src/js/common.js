/**
 * Created by CityLife on 23.12.16.
 */
/* ============= COMMON CONSTANTS, VARIABLES ============= */
/* реактивация кэшбэка *///TODO переделать
var CL_ALI_UID = '3Vby3rfe6';             // our new identifier in AliE
var ALI_CLEAR = 'aliexpress.com';         // clear url of Aliexpress.com
var ALI_COOKIE = 'aeu_cid';               // need cookie name of Aliexpress

/* ============= COMMON SERVICE FUNCTION ============= */
/**
 * Round float numbers
 * @param val {number} - rounded number
 * @param afterComa {number} - quantity of numbers after comma
 * @returns {number}
 */
function roundNumber(val, afterComa) {

    if (val % 1 > 0 && afterComa > 0) {
        return parseFloat(( Math.round(val * Math.pow(10, afterComa)) / Math.pow(10, afterComa) ));
    } else return parseInt(val);

}
