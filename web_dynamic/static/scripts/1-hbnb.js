$().ready(
  function () {
    $('.filters .amenities input:checkbox').change(function (evnt) {
      checkAmenities();
    });
  }
);

function checkAmenities () {
  const list = [];
  $('.filters .amenities input:checked').each((index, element) => {
    list.push(element.dataset.name);
  });
  $('.filters .amenities>h4').text(list.join(', '));
}
