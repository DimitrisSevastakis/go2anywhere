// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("theme");
  var theme = select.children[select.selectedIndex].value;
  localStorage["selected_theme"] = theme;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var selected = localStorage["selected_theme"];
  if (!selected) {
    return;
  }
  var select = document.getElementById("theme");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == selected) {
      child.selected = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);