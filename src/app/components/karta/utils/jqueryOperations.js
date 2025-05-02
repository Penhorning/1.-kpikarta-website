// Toggle left sidebar
export function togggleLeftSidebar() {
    $('#sidebar-two').toggleClass('active');
    $('.sidebar_collapsible_btn').toggleClass('show');
    if ($('#sidebar-two').hasClass('active')) {
      $('.sidebar_collapsible_btn img').attr('src', 'assets/img/side-arrow-left.svg');
    } else {
      $('.sidebar_collapsible_btn img').attr('src', 'assets/img/side-arrow-right.svg')
    }
}
// Hide the left sidebar
export function hideLeftSidebar() {
    $('#sidebar-two').removeClass('active');
    $('.sidebar_collapsible_btn').removeClass('show');
}
// Close right sidebar
export function closeRightSidebar() {
    $('#rightSidebar, .right_sidebar_overlay').removeClass('open');
    $('body').removeClass('rightSidebarOpened');
    // Remove color from highlighted node when properties closed
    $(".node-text").css('background-color', "#ffffff");
}
// Open right sidebar
export function openRightSidebar(value) {
    $('#rightSidebar, .right_sidebar_overlay').addClass('open');
    if (value && value !== 0) $('#rightSidebar').scrollTop(value);
    else $('#rightSidebar').scrollTop(0);
    $('body').addClass('rightSidebarOpened');
}
// Disable Element
export function disablePhase() {
    $('.phase_column').addClass('disableDiv');
}
// Enable Element
export function enablePhase() {
    $('.phase_column').removeClass('disableDiv');
}
// Disable chart
export function disableCommonPhase() {
  $("#common_phase_dtl_wrap").css("pointer-events", "none", "cursor", "default");
  $('#common_phase_dtl_wrap').addClass('disableDiv');
}
// Enable chart
export function enableCommonPhase() {
  $("#common_phase_dtl_wrap").css("pointer-events", "all", "cursor", "pointer");
  $('#common_phase_dtl_wrap').removeClass('disableDiv');
}
// Disable chart
export function disableChart() {
    $("#karta-svg svg .node").css("pointer-events", "none", "cursor", "default");
    $('#karta-svg').addClass('disableKarta');
    $('.karta_column').addClass('disableKarta');
    $('.phase_column').addClass('disableDiv');
    $('.phase_name').addClass('disableSpan');
    $(".phase_name").css("pointer-events", "none", "cursor", "default");
}
// Enable chart
export function enableChart() {
    // const isZoomed = getAttribute("#karta-svg svg g", "transform");
    // if (!isZoomed) $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
    $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
    $('#karta-svg').removeClass('disableKarta');
    $('.karta_column').removeClass('disableKarta');
    $('.phase_column').removeClass('disableDiv');
    $(".phase_name").css("pointer-events", "all", "cursor", "pointer");
}
// Show modal
export function showModal(id) {
    $(`#${id}`).modal('show');
}
// Hide modal
export function hideModal(id) {
    $(`#${id}`).modal('hide');
}
// Get width
export function getWidth(element) {
    $(element).width();
}
// Get Height
export function getHeight(element) {
    $(element).height();
}
// Set value
export function setValue(element, value) {
    $(element).val(value);
}
// Set style
export function setStyle(element, property, value) {
    $(element).css(property, value);
}
// Set attribute
export function setAttribute(element, property, value) {
    $(element).attr(property, value);
}
// Get attribute
export function getAttribute(element, attribute) {
    return $(element).attr(attribute);
}
// Disable element
export function disableElement(element) {
    $(element).css("pointer-events", "none", "cursor", "default");
}
// Enable element
export function enableElement(element) {
    $(element).css("pointer-events", "all", "cursor", "pointer");
}
// Remove element
export function removeElement(element) {
    $(element).remove();
}
// Remove karta
export function removeKarta() {
    $('#karta-svg').children("svg").eq(1).remove();
}
