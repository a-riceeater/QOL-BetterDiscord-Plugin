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
  console.log("QOL PLUGIN SETTINGS:")
  console.log(settings);

  function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
      !isNaN(parseFloat(str))
  }

  const messages = _(".chatContent-3KubbW") // where messages are loaded; parent element
  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // catch deleted messages
    for (const mutation of mutationList) {
      mutation.removedNodes.forEach(removedNode => {
        if (removedNode.innerHTML.includes("isSending-3SiDwE")) return
        if (!removedNode.getAttribute("class").includes("messageListItem")) return
        console.log("NODE REMOVED: " + removedNode.innerHTML)
        console.log(removedNode.tagName, removedNode.getAttribute("id", removedNode.className));

        // recreate the message
        const recreateMessage = document.createElement("li")
        recreateMessage.innerHTML = removedNode.innerHTML + " <span style='color: red'>(deleted)</span>"
        recreateMessage.setAttribute("class", "bd-qol-messagelogging-deleted")
        recreateMessage.setAttribute("title", "(A deleted message)")
        recreateMessage.style.setProperty("color", "red", "important")
        document.querySelector(".scrollerInner-2PPAp2").appendChild(recreateMessage);
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
      //observer.observe(document.querySelector("#chatContent-3KubbW"), config);
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
        //setTimeout(timerIncrement, 1000);
      }

      //timerIncrement()

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
            document.querySelector("#bd-discordpswrd-qol-input").focus();
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
        document.querySelectorAll(".buttonWrapper-3YFQGJ").forEach(button => {
          if (settings.hideMsgIcons == false) return
          button.style.display = 'none'; // message bar
        })

        document.querySelectorAll(".icon-2W8DHg").forEach(button => {
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
      //setTimeout(function() {
        //observer.disconnect()
        //observer.observe(document.querySelector(".scrollerInner-2PPAp2"), config);
      //}, 1000)
      function hideIcons() {
        console.log("hiding icons");
        document.querySelectorAll(".buttonWrapper-3YFQGJ").forEach(button => {
          if (settings.hideMsgIcons == false) return
          button.style.display = 'none'; // message bar
        })

        document.querySelectorAll(".icon-2W8DHg").forEach(button => {
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
      titleIcons.innerHTML = "Icons"
      titleIcons.style.color = "white"
      titleIcons.style.fontWeight = "bold"
      titleIcons.style.marginBottom = "10px";

      panel.appendChild(titleIcons);

      const showChannelIcons = document.createElement("div");
      showChannelIcons.classList.add("setting");

      const sci_l = document.createElement("span")
      sci_l.innerHTML = "Hide Channel Icons (#)"
      sci_l.style.marginLeft = "10px"
      sci_l.style.color = "white"
      sci_l.style.verticalAlign = "middle"

      const sci = document.createElement("input")
      sci.type = "checkbox"
      sci.style.cursor = "pointer"
      sci.style.height = "20px"
      sci.style.width = "20px"
      sci.style.verticalAlign = "middle";

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
      smi_l.innerHTML = "Hide Message Box Icons"
      smi_l.style.marginLeft = "10px"
      smi_l.style.color = "white"
      smi_l.style.height = "20px"
      smi_l.style.width = "20px"
      smi_l.style.verticalAlign = "middle"

      const smi = document.createElement("input")
      smi.type = "checkbox"
      smi.style.cursor = "pointer"
      smi.style.height = "20px"
      smi.style.width = "20px"
      smi.style.verticalAlign = "middle"

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
      titlePs.innerHTML = "Password Settings"
      titlePs.style.color = "white"
      titlePs.style.fontWeight = "bold"
      titlePs.style.marginBottom = "10px"
      titlePs.style.marginTop = "10px";

      const passwordP = document.createElement("div");
      passwordP.appendChild(titlePs);

      const pswrd_input = document.createElement("input")
      pswrd_input.type = "password"
      pswrd_input.style.border = "none"
      pswrd_input.style.background = "none"
      pswrd_input.style.borderBottom = "1.5px solid white"
      pswrd_input.style.textAlign = "left"
      pswrd_input.style.fontSize = "15px"
      pswrd_input.style.verticalAlign = "middle"
      pswrd_input.style.color = "aqua"
      pswrd_input.addEventListener("keypress", (e) => {
        var char = String.fromCharCode(e.which)
        if (!isNumeric(char)) e.preventDefault();
        settings.password = pswrd_input.value;
        BdApi.saveData(meta.name, "settings", settings);
      })


      const pswrd_il = document.createElement("span")
      pswrd_il.innerHTML = "Pin"
      pswrd_il.style.marginLeft = "10px"
      pswrd_il.style.color = "white"
      pswrd_il.style.height = "20px"
      pswrd_il.style.width = "20px"
      pswrd_il.style.verticalAlign = "middle"

      const password_timeout = document.createElement("input")
      password_timeout.value = "60"
      password_timeout.type = "number"
      password_timeout.style.border = "none"
      password_timeout.style.background = "none"
      password_timeout.style.borderBottom = "1.5px solid white"
      password_timeout.style.textAlign = "left"
      password_timeout.style.fontSize = "15px"
      password_timeout.style.verticalAlign = "middle"
      password_timeout.style.color = "aqua"

      password_timeout.addEventListener("keypress", (e) => {
        var char = String.fromCharCode(e.which)
        if (!isNumeric(char)) e.preventDefault();
        settings.password_timeout = password_timeout.value;
        BdApi.saveData(meta.name, "settings", settings);
      })

      const lineBreak1 = document.createElement("br")

      const pswrdt_l = document.createElement("span")
      pswrdt_l.innerHTML = "Lock after x seconds"
      pswrdt_l.style.marginLeft = "10px"
      pswrdt_l.style.color = "white"
      pswrdt_l.style.height = "20px"
      pswrdt_l.style.width = "20px"
      pswrdt_l.style.verticalAlign = "middle"

      passwordP.append(pswrd_input, pswrd_il)
      passwordP.append(lineBreak1, password_timeout, pswrdt_l)
      /*
      const messageLogging = document.createElement("div")
      messageLogging.style.fontWeight = "bold"
      messageLogging.style.marginBottom = "10px"
      messageLogging.style.marginTop = "10px"
      messageLogging.innerHTML = `
      <h2 style="color: white">Message Logging</h2>
      <br>
      `

      const msgDeleteCheck = document.createElement("input")
      msgDeleteCheck.type = "checkbox"
      msgDeleteCheck.setAttribute("style","height: 20px; width: 20px; cursor: pointer; vertical-align: middle;")

      const msgDeleteCheck_label = document.createElement("span")
      msgDeleteCheck_label.innerHTML = "Show deleted messages"
      msgDeleteCheck_label.setAttribute("style", "color: white; margin-left: 10px; height: 20px; width: 20px; vertical-align: middle;")

      const lineBreak2 = document.createElement("br")

      const msgEditCheck = document.createElement("input")
      msgEditCheck.type = "checkbox"
      msgEditCheck.setAttribute("style","height: 20px; width: 20px; cursor: pointer; vertical-align: middle;")

      const msgEditCheck_label = document.createElement("span")
      msgEditCheck_label.innerHTML = "Show edited messages"
      msgEditCheck_label.setAttribute("style", "color: white; margin-left: 10px; height: 20px; width: 20px; vertical-align: middle;")

      messageLogging.append(msgDeleteCheck, msgDeleteCheck_label)
      messageLogging.append(lineBreak2, msgEditCheck, msgEditCheck_label)
      */
      panel.append(showChannelIcons, showMessageIcons, passwordP); // message logging
      /*
      msgDeleteCheck.addEventListener("change", (e) => {

      })

      msgEditCheck.addEventListener("click", (e) => {

      })*/


      return panel;
    }
  }
};
