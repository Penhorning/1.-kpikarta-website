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
}
// Open right sidebar
export function openRightSidebar(value) {
    $('#rightSidebar, .right_sidebar_overlay').addClass('open');
    if(value && value !== 0){
      $('#rightSidebar').scrollTop(value);
    }
    else {
      $('#rightSidebar').scrollTop(0);
    }
    $('body').addClass('rightSidebarOpened');
}
// Disable chart
export function disableChart() {
    $("#karta-svg svg .node").css("pointer-events", "none", "cursor", "default");
}
// Enable chart
export function enableChart() {
    $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
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
// Remove element
export function removeElement(element) {
    $(element).remove();
}
// Remove karta
export function removeKarta() {
    $('#karta-svg').children("svg").eq(1).remove();
}