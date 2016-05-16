export function preventDefault() {
  return {
    link: function(scope, elem, attrs, ctrl) {

      elem.bind("click", function(event) {
        event.preventDefault();
      });
    }
  };
}
