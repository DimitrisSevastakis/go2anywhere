// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("theme");
  var selectTab = document.getElementById("tab");
  var theme = select.children[select.selectedIndex].value;
  var defTab = selectTab.children[selectTab.selectedIndex].value;
  localStorage["selected_theme"] = theme;
  localStorage["selected_tab"] = defTab;

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
  var selectedTab = localStorage["selected_tab"];
  if(!selectedTab){
    return;
  }
  var selectTab = document.getElementById("tab");
  for (var i = 0; i < selectTab.children.length; i++) {
    var child = selectTab.children[i];
    if (child.value == selectedTab) {
      child.selectedTab = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);