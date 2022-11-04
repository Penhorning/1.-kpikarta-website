module.exports = function jqueryFunctions() {
    // DISABLE CHART FUNCTIONS
    function disableChart() {
        $("#karta-svg svg .node").css("pointer-events", "none", "cursor", "default");
    }
    // ENABLE CHART FUNCTIONS
    function enableChart() {
        $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
    }
}