/**
 * Created by CityLife on 23.12.16.
 */
/* ============= COMMON SERVICE FUNCTION ============= */
/**
 * Round float numbers
 * @param val {number} - rounded number
 * @param afterComa {number} - quantity of numbers after comma
 * @returns {number}
 */
function roundNumber(val, afterComa) {
    if (val % 1 > 0 && afterComa > 0) {
        return ( Math.round(val * Math.pow(10, afterComa)) / Math.pow(10, afterComa) );
    } else return val;
}
