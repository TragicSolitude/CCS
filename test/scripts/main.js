window.onload = function () {
  window.div1 = new CCS('test.html', '#contentWrapper', {
    auto: false,
    onready: function () {
      console.log('Data loaded');
    }
  });

  document.querySelector('#ss').addEventListener('click', function () {
    div1.load();
  });

  document.querySelector('#dd').addEventListener('click', function () {
    div1.unload();
  })
}