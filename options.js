// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("theme");
  var selectTab = document.getElementById("tab");
  var style = document.getElementById("view")

  var theme = select.children[select.selectedIndex].value;
  var defTab = selectTab.children[selectTab.selectedIndex].value;
  var viewStyle = style.children[style.selectedIndex].value;
  
  chrome.storage.local.set({'go2anywhere/selected_theme': theme}, function() {
    console.log('Settings saved');
  });
  chrome.storage.local.set({'go2anywhere/selected_tab': defTab}, function() {
    console.log('Settings saved');
  });
  chrome.storage.local.set({'go2anywhere/selected_style': viewStyle}, function() {
    console.log('Settings saved');
  });

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  chrome.storage.local.get(['go2anywhere/selected_theme'], function(selected) {
    if (!selected) {
      return;
    }
    selected = selected['go2anywhere/selected_theme']
    var select = document.getElementById("theme");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == selected) {
        child.selected = "true";
        break;
      }
    }
  });

  chrome.storage.local.get(['go2anywhere/selected_tab'], function(selected) {
    if (!selected) {
      return;
    }
    selected = selected['go2anywhere/selected_tab']
    var select = document.getElementById("tab");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == selected) {
        child.selected = "true";
        break;
      }
    }
  });

  chrome.storage.local.get(['go2anywhere/selected_style'], function(selected) {
    if (!selected) {
      return;
    }

    selected = selected['go2anywhere/selected_style']
    var select = document.getElementById("view");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == selected) {
        child.selected = "true";
        break;
      }
    }
  });

}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);