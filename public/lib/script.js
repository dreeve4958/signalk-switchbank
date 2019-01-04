const CONFIG_FILE = "config.json";
const MANIFEST_FILE = "manifest.json";
const STATE_FILE = "state.json";

var config = null;
var manifest = null;

/**
 * Initialises the page by setting the page heading and attempting to load the
 * page manifest from MANIFEST_FILE. If the load is successful, then the
 * script continues to initialise the display.
 */

function init() {
    if (((config = JSON.parse(loadFile(CONFIG_FILE))) != null) && ((manifest = JSON.parse(loadFile(MANIFEST_FILE))) != null)) {
        document.getElementsByTagName('h1')[0].innerHTML = config.title;
        generatePageContent()
        setInterval(updateState, 1000);
    } else {
        document.getElementById('missingfile').innerHTML = (config == null)?CONFIG_FILE:MANIFEST_FILE;
        document.getElementById('error').style.display = 'block';
    }
}

function generatePageContent() {
    var content = "<table>";
    manifest.switchbanks.forEach(module => {
        content += "<tr>";
        content += "<td class='rowhead'>Module " + module['instance'] + "</td>";
        content += "<td>";
        content += "<span class='description'>" + module['description'] + "<br>";
        content += "<table><tr>";
        for (var i = 0; i < module['channels'] ; i++) {
            content += "<td id='M" + module['instance'] + "C" + i +  "' class='channel channel-off'>";
            content += getRuleComment(module['type'][0], module['instance'], i);
            content += "</td>";
        }
        content += "</table>";

        content += "</td>";
        content += "</tr>";
    });
    content += "</table>";
    document.getElementById('menu').innerHTML = content;
}

function getRuleComment(type, instance, channel) {
    retval = "";
    manifest.rules.forEach(rule => {
        var pathname = rule[type + "path"];
        if ((getInstance(pathname) == instance) && (getChannel(pathname) == channel)) {
            retval = rule['comment'];
        }
    });
    return(retval);
}

function getInstance(path) { return(path.split('.')[2]); }
function getChannel(path) { return(path.split('.')[3] - 1); }

function updateState() {
    if ((state = JSON.parse(loadFile(STATE_FILE))) != null) {
        Object.keys(state).forEach(key => {
            for (var i = 0; i < state[key].length; i++) {
                var k = "M" + key + "C" + i;
                document.getElementById(k).classList.remove("channel-off");
                document.getElementById(k).classList.remove("channel-on");
                document.getElementById(k).classList.add("channel-" + (state[key][i]?"on":"off"));
            }
        });
    }
}

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}
