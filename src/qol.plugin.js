/**
 * @name QOLPlugin
 * @author ghostyval
 * @description A QOL Plugin with button hiding, lock screen etc.
 * @version 0.0.1
 */

module.exports = meta => {
  var removed = false;
  const shade = document.createElement("div")
  const password_input = document.createElement("div")


  const defaults = {
    password: "",
    hideMsgIcons: false,
    hideChannelIcons: false,
    idleTime: 60,
    logDeletedMessages: false,
    logEditedMessages: false,
  };

  const settings = {};

  const stored_data = BdApi.loadData(meta.name, "settings");
  Object.assign(settings, defaults, stored_data);
  console.log(`QOL PLUGIN SETTINGS: ${settings}`)

  function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
      !isNaN(parseFloat(str))
  }

  const messages = _("messages") // where messages are loaded; parent element
  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // catch deleted messages
    for (const mutation of mutationList) {
      mutation.removedNodes.forEach(removedNode => {
        console.log("NODE REMOVED: " + removedNode.innerHTML)
        // recreateMessage
        const recreateMessage = document.createElement("div")
          .innerHTML = removedNode.innerHTML
            .setAttribute("class", "bd-qol-messagelogging-deleted")
              .setAttribute("title", "(A deleted message)")
        messages.appendChild(recreateMessage);
      })
    }
  };

  const observer = new MutationObserver(callback);

  function _(query) {
    function _(query, all) {
      if (all) {
        if (query.startsWith("#") || query.startsWith(".")) {
          return document.querySelectorAll(query);
        }
        return false;
      }
      else if (!all || all == null) {
        if (query.startsWith("#") || query.startsWith(".")) {
          return document.querySelector(query);
        }
        else {
          return false;
        }
      }
    }
  }

  return {
    start: () => {
      observer.observe(messages, config);

      // Password/Lock 
      //BdApi.alert("Welcome!", "QOL Plugin activated.");
      var idleTime = 0;
      var inAnimationPhase = false;

      const mo = document.addEventListener("mousemove", resetIdle)
      const kp = document.addEventListener("keypress", (e) => {
        idleTime = 0;
        if (password_input.style.display == "block") {
          if (!e) e = event;
          if (!isNumeric(String.fromCharCode(e.which))) return
          e.preventDefault();
          inputtedPassword += String.fromCharCode(e.which);
          _("#bd-discordpswrd-qol-input").value = inputtedPassword;
          authPassword();
        }
      });

      function resetIdle() {
        idleTime = 0;
      }

      function timerIncrement() {
        if (removed) return
        idleTime = idleTime + 1;
        //console.log(idleTime);
        if (idleTime > settings.idleTime) {
          shade.style.display = "block"
          password_input.style.display = "block"
          return;
        }
        setTimeout(timerIncrement, 1000);
      }

      timerIncrement()

      shade.style.position = "fixed";
      shade.style.top = "0%";
      shade.style.left = "0%";
      shade.style.background = "black"
      shade.style.width = "100%";
      shade.style.height = "100%";
      shade.style.opacity = "0.95";
      shade.style.zIndex = "9998";
      shade.style.display = "none";
      shade.id = "bd-discordpswrd-qol-shade";
      document.body.append(shade)


      password_input.style.position = "fixed";
      password_input.style.top = "55%";
      password_input.style.left = "50%";
      password_input.style.background = "transparent";
      password_input.style.width = "50%";
      password_input.style.height = "50%";
      password_input.style.zIndex = "9999";
      password_input.style.display = "none"
      password_input.style.opacity = "1"
      password_input.style.color = "white";
      password_input.style.textAlign = "center";
      password_input.style.transform = "translate(-50%, -50%)";
      password_input.id = "bd-discordpswrd-qol-pl"
      password_input.innerHTML = `
      <h1 style="text-decoration: underline;">Enter Discord Password</h1>
      <br><br>
      <input type="password" id="bd-discordpswrd-qol-input" disabled>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">1</span> <span align="center" class="bd-discordpswrd-qol-num">2</span> <span align="center" class="bd-discordpswrd-qol-num">3</span>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">4</span> <span align="center" class="bd-discordpswrd-qol-num">5</span> <span align="center" class="bd-discordpswrd-qol-num">6</span>
      <br><br>
      <span align="center" class="bd-discordpswrd-qol-num" style="margin-left: 50px;">7</span> <span align="center" class="bd-discordpswrd-qol-num">8</span> <span align="center" class="bd-discordpswrd-qol-num">9</span>
      <br><br>
      <span align="center" id="bd-discordpswrd-qol-backspace"><span style="font-size: 55px; vertical-align: middle;" data="bd-discordpswrd-qol-backspace">&#x2190;</span> <span style="font-size: 20px; vertical-align: middle;" data="bd-discordpswrd-qol-backspace">Backspace</span></span>
      `
      document.body.append(password_input)

      BdApi.injectCSS("QOLPlugin", `
    .bd-discordpswrd-qol-num:hover {
      color: #0be3ca;
    }

    #bd-discordpswrd-qol-input {
      border: none; 
      border-bottom: 1.5px solid white; 
      width: 200px; color: white; 
      font-size: 45px; 
      text-align: center; 
      background: transparent;
      transition: .5s;
    }

    .bd-discordpswrd-qol-num {
      font-size: 30px; 
      margin-right: 50px; 
      margin-bottom: 50px; 
      cursor: pointer; 
      text-align: center;
      width: 20px;
      transition: 1.5s;
    }

    #bd-discordpswrd-qol-backspace {
      transition: 1.5s;
      cursor: pointer;
      color: white;
    }

    #bd-discordpswrd-qol-backspace:hover {
      color: #0be3ca;
    }
  `);

      const detectKeyShow = document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.keyCode == 76) {
          if (shade.style.display == "none") {
            password_input.style.display = "block"
            shade.style.display = "block"
            _("#bd-discordpswrd-qol-input").focus();
          } else {
            password_input.style.display = "none"
            shade.style.display = "none"
          }
        }
      })

      var inputtedPassword = "";
      const detectNumPress = document.addEventListener("click", (e) => {
        if (!password_input.style.display == "none") return;
        if (inAnimationPhase == true) return;
        if (isNumeric(e.target.innerHTML) && !inAnimationPhase) {
          inputtedPassword += e.target.innerHTML;
          _("#bd-discordpswrd-qol-input").value = inputtedPassword;
          authPassword();
        } else if (e.target.getAttribute("data") == "bd-discordpswrd-qol-backspace" && inputtedPassword.length > 0 && !inAnimationPhase) {
          inputtedPassword = inputtedPassword.slice(0, -1)
          _("#bd-discordpswrd-qol-input").value = inputtedPassword;
        } else if (e.shiftKey && e.ctrlKey && e.keyCode == 73 && password_input.style.display == "block") {
          e.preventDefault();
        }
      })

      function authPassword() {
        if (inputtedPassword.length == 4) {
          if (inputtedPassword == "1224") {
            _("#bd-discordpswrd-qol-input").style.color = "#0be3ca"
            inputtedPassword = "";
            inAnimationPhase = true;
            setTimeout(function () {
              password_input.style.display = "none"
              shade.style.display = "none"
              _("#bd-discordpswrd-qol-input").style.color = "white"
              _("#bd-discordpswrd-qol-input").value = ""
              inAnimationPhase = false;
              timerIncrement();
              return
            }, 1200)
          } else {
            _("#bd-discordpswrd-qol-input").style.color = "red"
            inputtedPassword = "";
            inAnimationPhase = true;
            setTimeout(function () {
              _("#bd-discordpswrd-qol-input").value = ""
              _("#bd-discordpswrd-qol-input").style.color = "white"
              inAnimationPhase = false;
              return
            }, 500)
          }
        }
      }

      // Hide icons
      function hideIcons() {
        console.log("hiding icons");
        _(".buttonWrapper-3YFQGJ", true).forEach(button => {
          if (settings.hideMsgIcons == false) return
          button.style.display = 'none'; // message bar
        })

        _(".icon-2W8DHg").forEach(button => {
          if (settings.hideChannelIcons == false) return
          button.style.display = 'none'; // channel icons
        })

        //setInterval(hideIcons, 60000);
      }
      hideIcons();
    },

    stop: () => {
      BdApi.clearCSS("QOLPlugin");
      shade.remove()
      observer.disconnect();
      password_input.remove()
      removed = true;
      //document.removeEventListener("keydown", detectKeyShow)
      //document.removeEventListener("keypress", kp)
      //document.removeEventListener("mousemove", mo)
    },
    onSwitch: () => {
      observer.disconnect()
      observer.observe(messages, config);
      function hideIcons() {
        console.log("hiding icons");
        _(".buttonWrapper-3YFQGJ", true).forEach(button => {
          if (settings.hideMsgIcons == false) return
          button.style.display = 'none'; // message bar
        })

        _(".icon-2W8DHg", true).forEach(button => {
          if (settings.hideChannelIcons == false) return
          button.style.display = 'none'; // channel icons
        })
      }
      hideIcons();
    },
    getSettingsPanel: () => {
      const panel = document.createElement("div");
      panel.id = "bd-discordpswrd-settings-panel";

      const titleIcons = document.createElement("h2")
        .innerHTML = "Icons"
          .style.color = "white"
            .style.fontWeight = "bold"
              .style.marginBottom = "10px";

      panel.appendChild(titleIcons);

      const showChannelIcons = document.createElement("div");
      showChannelIcons.classList.add("setting");

      const sci_l = document.createElement("span")
        .innerHTML = "Hide Channel Icons (#)"
          .style.marginLeft = "10px"
            .style.color = "white"
              .style.verticalAlign = "middle"

      const sci = document.createElement("input")
        .type = "checkbox"
          .style.cursor = "pointer"
            .style.height = "20px"
              .style.width = "20px"
                .style.verticalAlign = "middle";

      sci.checked = settings.hideChannelIcons;

      sci.addEventListener("change", (e) => {
        if (sci.checked) {
          settings.hideChannelIcons = true;
          BdApi.saveData(meta.name, "settings", settings);
        } else {
          settings.hideChannelIcons = false;
          BdApi.saveData(meta.name, "settings", settings);
        }
      })

      showChannelIcons.append(sci, sci_l);


      const showMessageIcons = document.createElement("div");
      showMessageIcons.classList.add("setting");

      const smi_l = document.createElement("span")
        .innerHTML = "Hide Message Box Icons"
          .style.marginLeft = "10px"
            .style.color = "white"
              .style.height = "20px"
                .style.width = "20px"
                  .style.verticalAlign = "middle"

      const smi = document.createElement("input")
        .type = "checkbox"
          .style.cursor = "pointer"
            .style.height = "20px"
              .style.width = "20px"
                .style.verticalAlign = "middle"

      smi.checked = settings.hideMsgIcons;

      smi.addEventListener("change", (e) => {
        if (smi.checked) {
          settings.hideMsgIcons = true;
          BdApi.saveData(meta.name, "settings", settings);
        } else {
          settings.hideMsgIcons = false;
          BdApi.saveData(meta.name, "settings", settings);
        }
      })

      showMessageIcons.append(smi, smi_l);

      const titlePs = document.createElement("h2")
        .innerHTML = "Password Settings"
          .style.color = "white"
            .style.fontWeight = "bold"
              .style.marginBottom = "10px"
                .style.marginTop = "10px";

      const passwordP = document.createElement("div");
      passwordP.appendChild(titlePs);

      const pswrd_input = document.createElement("input")
        .type = "password"
          .style.border = "none"
            .style.background = "none"
              .style.borderBottom = "1.5 px solid white"
                .style.textAlign = "left"
                  .style.fontSize = "15px"
                    .style.verticalAlign = "middle"
      pswrd_input.addEventListener("keypress", (e) => {
        var char = String.fromCharCode(e.which)
        if (!isNumeric(char)) e.preventDefault();
      })


      const pswrd_il = document.createElement("span")
        .innerHTML = "Pin"
          .style.marginLeft = "10px"
            .style.color = "white"
              .style.height = "20px"
                .style.width = "20px"
                  .style.verticalAlign = "middle"

      const password_timeout = document.createElement("input")
        .value = "60"
          .type = "number"

      const pswrdt_l = document.createElement("span")
        .innerHTML = "Lock after x seconds"
          .style.marginLeft = "10px"
            .style.color = "white"
              .style.height = "20px"
                .style.width = "20px"
                  .style.verticalAlign = "middle"

      passwordP.append(pswrd_input, pswrd_il, password_timeout, pswrdt_l)

      const messageLogging = document.createElement("div")
      .style.fontWeight = "bold"
        .style.marginBottom = "10px"
          .style.marginTop = "10px"
            .innerHTML = `
      <h2>Message Logging</h2>
      <br>
      <input type="checkbox" id="bd-messagelogging-delete-checkbox" style="height: 20px; width: 20px; cursor: pointer;vertical-align: middle;"> <span style="color: white; margin-left: 10px; height: 20px; width: 20px; vertical-align: middle;"> Show deleted messages</span>
      <br>
      <input type="checkbox" id="bd-messagelogging-edit-checkbox" style="height: 20px; width: 20px; cursor: pointer;vertical-align: middle;">
      `

      _("#bd-messagelogging-delete-checkbox").addEventListener("click", (e) => {

      })

      _("#bd-messagelogging-edit-checkbox").addEventListener("click", (e) => {

      })

    
      panel.append(showChannelIcons, showMessageIcons, passwordP, messageLogging);

      return panel;
    }
  }
};
