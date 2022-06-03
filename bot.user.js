// ==UserScript==
// @name         Hri7566's Selfbot
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  try to take over the world!
// @author       Hri7566
// @match        https://*.multiplayerpiano.com/*
// @match        https://www.multiplayerpiano.net/*
// @match        https://*.multiplayerpiano.net/*
// @match        https://mpp.terrium.net/*
// @match        https://mppclone.com/*
// @match        https://mpp.hri7566.info/*
// @match        https://*.multiplayerpiano.org/*
// @match        https://*.multiplayerpiano.dev/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     MATERIAL_CSS https://unpkg.com/material-components-web@latest/dist/material-components-web.min.css
// @resource     ICONS_CSS https://fonts.googleapis.com/icon?family=Material+Icons
// @require      https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
// @require      https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/loaders/GLTFLoader.js
// ==/UserScript==

const oldLog = console.log;
console.log = (...args) => {
    oldLog(...args);
    chat(args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg);
        }
        return arg;
    }).join(" "));
}

const oldError = console.error;
console.error = (...args) => {
    oldError(...args);
    chat("[ERROR] " + args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg);
        }
        return arg;
    }).join(" "));
}

const oldWarn = console.warn;
console.warn = (...args) => {
    oldWarn(...args);
    chat("[WARN] " + args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg);
        }
        return arg;
    }).join(" "));
}

const oldDebug = console.debug;
console.debug = (...args) => {
    oldDebug(...args);
    chat("[DEBUG] " + args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg);
        }
        return arg;
    }).join(" "));
}

/*
const material = GM_getResourceText("MATERIAL_CSS");
GM_addStyle(material);

const icons = GM_getResourceText("ICONS_CSS");
GM_addStyle(icons);

$("#bottom .relative").append(`<button class="mdc-button hri-test-button">
  <div class="mdc-button__ripple"></div>
  <span class="mdc-button__label">Button</span>
</button>`);

$("#hri-test-button").css("position", "absolute").css("left", "780px").css("top", "4px");

$("#hri-test-button .mdc-button__label").css("background-color", "white");
*/

// $("#chat").css("backdrop-filter", "blur(3px)").css("-webkit-backdrop-filter", "blur(3px)").css("transition-duration", "500ms");
// $("#room .more").css("background-color: #88998833");

// window.console = {
//     log: (str) => {
//         console.log(str);
//         if (typeof str !== "string") return;
//         MPP.chat.receive({
//             m: 'a',
//             a: str,
//             p: {
//                 _id: 'window',
//                 name: 'Console',
//                 // set color to self color
//                 color: MPP.client.getOwnParticipant().color || "#ffffff"
//             },
//             t: Date.now()
//         });
//     }
// }

String.prototype.toUnicode = function(){
    var result = "";
    let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()[]{}\"`'\\/|;:,.<>?";
    for(var i = 0; i < this.length; i++){
        // Assumption: all characters are < 0xffff
        if (alphabet.indexOf(this[i]) == -1) {
            result += "\\u" + ("000" + this[i].charCodeAt(0).toString(16)).substr(-4);
        } else {
            result += this[i];
        }
    }
    return result;
};

Color.getNearestColor = function (hex) {
	let colorarr = [];
	for (var color of Object.keys(Color.map)) {
		colorarr.push(Color.map[color].distance(Color.hexToRgb(hex)))
	}
	return Object.keys(Color.map)[colorarr.indexOf(Math.min(...colorarr))];
}

function getRooms() {
    return new Promise(function (resolve, reject) {
        client.once("ls", msg => {
            resolve(msg.u);
            client.sendArray([{
                m: "-ls"
            }]);
        });
        client.sendArray([{
            m: "+ls"
        }]);
    });
}

function getPart(str) {
    let part;
    Object.keys(client.ppl).forEach(_id => {
        let p = client.ppl[_id];
        if (p._id.toLowerCase().includes(str.toLowerCase()) || p.name.toLowerCase().includes(str.toLowerCase()) || p.id.toLowerCase().includes(str.toLowerCase())) {
            part = p;
        }
    });

    return part;
}

var QuoteArray = [];

$.getJSON("https://raw.githubusercontent.com/Hri7566/hri-bot/master/quotes.json", (data) => {
    QuoteArray = data;
});

let prefix = "[";
let cmds = [];

globalThis.sb_data = {
    user: {
        name: "Selfbot",
        _id: "selfbot",
        color: "#9900ff"
    }
}

let chat = (str) => {

    var li = $('<li><span class="timestamp"/><span class="id"/><span class="name"/><span class="message"/></li>');

    // li.find(".name").text(MPP.client.getOwnParticipant().name + ":");
    li.find(".name").text(sb_data.user.name + ":");
    li.find(".message").text(str);
    li.find(".timestamp").text(new Date().toLocaleTimeString());
    li.find(".id").text(sb_data.user._id);
    li.find(".name, .message").css("color", sb_data.user.color || "white");

    $("#chat ul").append(li);

    var eles = $("#chat ul li").get();
    for(var i = 1; i <= 50 && i <= eles.length; i++) {
        eles[eles.length - i].style.opacity = 1.0 - (i * 0.03);
    }
    if(eles.length > 50) {
        eles[0].style.display = "none";
    }
    if(eles.length > 256) {
        $(eles[0]).remove();
    }

    // scroll to bottom if not "chatting" or if not scrolled up
    if(!$("#chat").hasClass("chatting")) {
        MPP.chat.scrollToBottom();
    } else {
        var ele = $("#chat ul").get(0);
        if(ele.scrollTop > ele.scrollHeight - ele.offsetHeight - 50)
            MPP.chat.scrollToBottom();
    }
}

let uri = "wss://bot.hri7566.info:8080";
/*
window.ws = new WebSocket(uri);

ws.onopen = () => {
    chat("Selfbot: Connected to 7566");
};

ws.onclose = () => {
    chat('Selfbot: Disconnected from 7566');
};

ws.onerror = err => {
    console.error(err);
    chat('Selfbot: Error connecting to 7566 - Check log for details');
};

ws.onmessage = data => {
    chat(data);
};
*/

get7 = () => {
    /*
    ws.send(JSON.stringify({m:'get'}));
    let ret;
    ws.on('message', data => {
        let msg = JSON.parse(data);
        if (msg.m == "get") {
            ret = msg.p;
        }
    });

    return ret;
    */
}

send7 = str => {
    /*
    let j = JSON.stringify({m:'a', a:str, p: get7()});
    ws.send(j);
    */
}

let addCommand = (cmd, minargs, func) => {
    cmds.push({
        cmd: cmd,
        minargs: minargs,
        func: func
    });
}

function g(str) {
    let ret;
    Object.keys(MPP.client.ppl).forEach(id => {
        let p = MPP.client.ppl[id];
        if (p.name.toLowerCase().includes(str.toLowerCase()) || p._id.toLowerCase().includes(str.toLowerCase()) || p.id.toLowerCase().includes(str.toLowerCase())) {
            ret = p;
        }
    });

    return ret;
}

addCommand('help', 0, msg => {
    let ret = `${name} Commands:`;
    cmds.forEach(c => {
        ret += ` ${prefix}${c.cmd} | `;
    });
    ret = ret.trim().substring(0, ret.length - 2);
    chat(ret);
});

addCommand('js', 1, msg => {
    let ret;
    try {
        ret = "Console: " + eval(msg.argcat);
    } catch (err) {
        ret = err;
    }
    chat(ret);
});

addCommand('h', 1, msg => {
    send7(msg.a);
});

addCommand('id', 0, msg => {
    chat(msg.p._id);
});

addCommand('b', 1, msg => {
    if (typeof(getPart("b40df99cc2ca6f503fba77cb")) !== 'undefined') {
        MPP.client.sendArray([{m:'a', message:"//kickban 30 " + msg.argcat}]);
    } else {
        MPP.client.sendArray([{m:'kickban', _id: msg.argcat, ms: 30 * 60 * 1000}]);
    }
});

addCommand('w', 1, msg => {
    let part = getPart(msg.argcat);
    let str = "Could not find player."

    if (typeof(part) !== 'undefined') {
        str = `[${part._id.substr(0, 6)}] ${part.name}: `;
        Object.keys(part).forEach(key => {
            str += `${key == "name" ? key.toUnicode() : key}: ${part[key]} | `;
        });
        str = str.substring(0, str.length - 2);
        str = str.trim();
    }

    chat(str);
});

addCommand('color', 1, msg => {
    MPP.client.sendArray([{m:'userset', set:{color:`${msg.args[1]}`}}]);
})

MPP.chat.send = (str) => {
    let msg = {
        p: MPP.client.getOwnParticipant(),
        a: str,
        args: str.split(' ')
    }

    msg.cmd = msg.args[0].split(prefix).join('');
    msg.argcat = msg.a.substring(prefix.length + msg.cmd.length).trim()

    if (str.startsWith(prefix)) {
        chat(str);
        cmds.forEach(c => {
            if (msg.cmd == c.cmd) {
                if (msg.args.length >= c.minargs) {
                    c.func(msg);
                }
            }
        });
    } else {
        MPP.client.sendArray([{m:'a', message:str}])
    }
}

MPP.client.on("participant added", p => {
    chat(`[${p._id}] ${p.name} joined.`);
});

MPP.client.on("participant removed", p => {
    chat(`[${p._id}] ${p.name} left.`);
});

MPP.client.on("a", msg => {
    let reg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    if(reg.test(msg.a)) {
        // let index = msg.a.search(reg);
        // $("#chat ul").last().html = $("#chat ul").last().html.substring(0, index - 1) + `<a href="${$("#chat ul").last().html.substring(index, )}"></a>`
        // console.log(msg.a.split(reg));
    }
});

// ==UserScript==
// @name         Hri7566's Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hri7566's tampermonkey bot
// @author       Hri7566
// @match        https://mppclone.com/*
// @icon         https://www.google.com/s2/favicons?domain=mppclone.com
// @grant        none
// ==/UserScript==

if (navigator.userAgent.includes("Electron")) {
    window.electron = true;
}

window.client = MPP.client;

window.sendChat = str => {
    client.sendArray([{
        m: "a",
        message: `\u034f${str}`
    }]);
}

window.setChannelSettings = set => {
    client.sendArray([{
        m: "chset",
        set: set
    }]);
}

window.msgBox = (title, text, html, target) => {
    new MPP.Notification({
        id: "hri-bot-msg",
        title: title,
        text: text,
        target: target || "#piano",
        duration: 7000,
        html: html
    });
}

window.gModal = null;

window.modalHandleEsc = (evt) => {
    if (evt.keyCode == 27) {
        closeModal();
        evt.preventDefault();
        evt.stopPropagation();
    }
}

window.openModal = (selector, focus) => {
    MPP.chat.blur();
    $(document).on("keydown", modalHandleEsc);
    $("#modal #modals > *").hide();
    $("#modal").fadeIn(250);
    $(selector).show();
    setTimeout(function() {
        $(selector).find(focus).focus();
    }, 100);
    gModal = selector;
}

window.closeModal = () => {
    $(document).off("keydown", modalHandleEsc);
    $("#modal").fadeOut(100);
    $("#modal #modals > *").hide();
    gModal = null;
}

class Bot {
    static usedBot = JSON.parse(localStorage.getItem('hriUsed')) == true;
    static started = false;
    static enabled = true;

    static theme = {
        color: localStorage.getItem('hriThemeColor') !== null ? new Color(localStorage.getItem('hriThemeColor')) : (() => { let c = new Color("#4488aa"); localStorage.setItem('hriThemeColor', c.toHexa()); return c; })(),
        borderSize: parseFloat(localStorage.getItem('hriThemeBorderSize')) || 1,
        blur: parseFloat(localStorage.getItem('hriThemeBlur')) || 5,
        blurDisabled: parseFloat(localStorage.getItem('hriThemeBlurDisabled')) || false,
    }

    static voiceKeyword = "computer";
    static calls = JSON.parse(localStorage.getItem("hriCalls")) || 0;

    // static cleverbotWS = new WebSocket('wss://mpp.hri7566.info:25563');

    static chatEnabled = false;

    static commands = [];
    static Command = class {
        constructor (cmd, usage, minargs, func, minrank, hidden) {
            this.cmd = cmd;
            this.usage = usage;
            this.minargs = minargs;
            this.func = func;
            this.minrank = minrank;
            this.hidden = hidden;
        }
    }

    static User = class {
        constructor (name, _id, color, rank) {
            this.name = name;
            this._id = _id;
            this.color = color;
            this.rank = typeof(rank) !== 'undefined' ? rank : {name: "None", _id: 0};
        }
    }

    static cursor = {
        enabled: false,
        pos: {
            x: 50,
            y: 50
        },
        vel: {
            x: 1,
            y: 10
        },
        acc: {
            x: 0,
            y: 0
        }
    }

    static start(client) {
        if (!client.isConnected()) return;

        this.userdata = (() => {
            if (localStorage.getItem('hri-userdata') == null || localStorage.getItem('hri-userdata') == 'null' || typeof(JSON.parse(localStorage.getItem('hri-userdata'))) == 'string') {
                let obj = {};
                obj[client.getOwnParticipant()._id] = {
                    name: client.getOwnParticipant().name,
                    color: client.getOwnParticipant().color,
                    _id: client.getOwnParticipant()._id,
                    rank: {
                        name: "Owner",
                        _id: 4
                    }
                }
                localStorage.setItem('hri-userdata', JSON.stringify(obj));
                return obj;
            } else {
                return JSON.parse(localStorage.getItem('hri-userdata'));
            }
        })();

        this.started = true;

        // closeModal();

        if (!this.usedBot) {
            msgBox("Welcome", undefined, 'This bot was made by <a href="https://gitlab.com/Hri7566" target="_blank">Hri7566</a>.');
            localStorage.setItem('hriUsed', true);
        } else {
            msgBox("Loaded", undefined, 'Bot loaded successfully.', '#volume');
        }

        this.addHTML();
        this.handleSpeechRecognition();
        this.startCursor();
        this.commands = [];
        this.prefix = '?';

        // cleverbot
        // this.cleverbotWS.addEventListener('message', evt => {
        //     sendChat(`AI: ${evt.data}`);
        // });

        // brave warning
        if (typeof window.navigator.brave !== 'undefined') {
            msgBox("Brave Warning", undefined, `<p>Sadly, voice functionality does not work in Brave.</p><p>If you want to use voice functionality, please use Chrome.</p> See <a href="https://github.com/brave/brave-browser/issues/2802" target="_blank">here</a> for more info.`);
        }

        // this.updateTheme();

        client.on('a', msg => {
            msg.args = msg.a.split(' ');
            msg.cmd = msg.args[0].toLowerCase().substring(this.prefix.length).trim();
            msg.argcat = msg.a.substring(this.prefix.length + msg.cmd.length).trim();
            msg.user = this.getUser(msg.p);
            msg.rank = this.getRank(msg.p);

            if (!this.enabled) return; // if (msg.rank._id < 3 && !this.enabled) return;

            this.commands.forEach(cmd => {
                if (msg.cmd == cmd.cmd && msg.args[0].startsWith(this.prefix)) {
                    if (msg.rank._id < 0) {
                        sendChat("You are banned.");
                        return;
                    }

                    if (msg.rank._id < cmd.minrank) {
                        sendChat(`You do not have permission to use '${msg.cmd}'.`);
                        return;
                    }

                    if (msg.args.length - 1 < cmd.minargs) {
                        sendChat(`Not enough arguments. Usage: ${this.getUsage(cmd.usage)}`);
                        return;
                    }

                    let out = cmd.func(msg, this);
                    this.incrementCalls();
                    if (typeof(out) !== 'undefined') {
                        if (out !== null) {
                            sendChat(out);
                        }
                    }
                }
            });
        });

        this.addCommand("help", `&PREFIXhelp (command)`, 0, msg => {
            let out = "";
            if (!msg.args[1]) {
                out = "Commands: ";
                this.commands.forEach(cmd => {
                    if (msg.rank._id >= cmd.minrank && !cmd.hidden) {
                        out += ` ${this.prefix}${cmd.cmd} | `;
                    }
                });
                out = out.substring(0, out.length - 2);
            } else {
                out = "Usage: ";
                this.commands.forEach(cmd => {
                    if (msg.argcat == cmd) {
                        out += this.getUsage(cmd.usage);
                    }
                });
            }
            return out;
        }, 0, false);

        // ai is broken
        // this.addCommand("ai", `&PREFIXai (text)`, 0, msg => {
        //     this.cleverbotWS.send(msg.argcat);
        // }, 0, false);

        this.addCommand("about", `&PREFIXabout`, 0, msg => {
            return "This bot is Hri7566's userscript.";
        }, 0, false);

        this.addCommand("id", `&PREFIXid`, 0, msg => {
            if (!msg.args[1]) return `Your ID: ${msg.p._id} | Your color: ${new Color(msg.p.color).getName().substr(10)} [${msg.p.color}]`;
            let user = getPart(msg.argcat);
            if (!user) return `User '${msg.argcat}' not found.`;
            return `${user.name}'s ID: ${user._id} | ${user.name}'s color: ${new Color(user.color).getName().substr(10)} [${user.color}]`;
        }, 0, false);

        this.addCommand("color", `&PREFIXcolor (color)`, 0, msg => {
            if (!msg.args[1]) return `Your color is ${new Color(msg.p.color).getName().replace("A", 'a')}. [${msg.p.color}]`;
            let user = getPart(msg.argcat);
            if (!user) return `User '${msg.argcat}' not found.`;
            return `${user.name}'s color is ${new Color(user.color).getName().replace("A", 'a')}. [${user.color}]`;
        }, 0, false);

        this.addCommand("8ball", `&PREFIX8ball (question)`, 1, msg => {
            let ballanswers = [
                "As I see it, yes",
                "Ask again later",
                "Better not tell you now",
                "Cannot predict now",
                "Concentrate and ask again",
                "Don't count on it",
                "It is certain",
                "It is decidedly so",
                "Most likely",
                "My reply is no",
                "My sources say no",
                "Outlook not so good",
                "Outlook good",
                "Reply hazy, try again",
                "Signs point to yes",
                "Very doubtful",
                "Without a doubt",
                "Yes",
                "Yes - definitely",
                "You may rely on it"
            ]
            return ballanswers[Math.floor(Math.random() * ballanswers.length)];
        }, 0, false);

        this.addCommand("quote", `&PREFIXquote [number]`, 0, msg => {
            let val = Math.floor(Math.random() * QuoteArray.length);
            try {
                if (msg.args[1]) val = parseInt(msg.args[1]);
            } catch (err) {

            }
            return `Quote #${val}: ${QuoteArray[val]}`;
        }, 0, false);

        this.addCommand("say", `&PREFIXsay [text]`, 1, msg => {
            return msg.argcat;
        }, 4, true);

        this.addCommand("rank", `&PREFIXrank [user]`, 0, msg => {
            let rank = msg.rank;
            let out = "Your rank";
            if (msg.args[1]) {
                let user = this.getUser(msg.argcat);
                if (!user) return `Could not find user.`;
                rank = this.getRank(user);
                out = `Rank of ${user.name}`;
            }
            return `${out}: ${rank.name} [${rank._id}]`;
        }, 0, false);

        this.addCommand("s", `&PREFIXs (cmd)`, 1, msg => {
            this.handleSpecialCmd("computer " + msg.argcat);
        }, 4, true);

        this.addCommand("js", `&PREFIXjs (eval)`, 1, (msg, bot) => {
            let ret;
            try {
                let ev = eval(msg.argcat);
                ret = `✔️ (${typeof ev}) ${eval(msg.argcat)}`;
            } catch (err) {
                ret = `❌ ${err}`;
            }
            return ret;
        }, 4, false);

        this.addCommand("setrank", `&PREFIXsetrank (user) (rank id)`, 2, (msg, bot) => {
            let lastarg = msg.args[msg.args.length - 1].trim();
            if (isNaN(lastarg)) return `Rank ID must be a number.`;
            if (parseInt(lastarg) >= msg.rank._id) return `You can't set a rank that high.`;

            let finder = getPart(msg.argcat.substring(0, msg.argcat.length - lastarg.length).trim());
            console.log(msg.argcat.substring(0, msg.argcat.length - lastarg.length));
            console.log(finder);
            let user = this.getUser(finder);
            if (!user) return `Could not find user.`;

            let outrank = this.getRankByID(parseInt(lastarg));
            this.setRank(user, outrank);
            this.saveUserData();
            return `User ${user.name}'s rank was set to ${outrank.name} [${outrank._id}].`;
        }, 1, false);

        this.addCommand("calls", `&PREFIXcalls`, 0, (msg, bot) => {
            return `Number of command calls: ${this.calls}`;
        }, 0, false);

        this.addCommand("cursor", `&PREFIXcursor (mode)`, 1, (msg, bot) => {
            // this.changeCursorMode(msg.argcat);
            // return `Changed cursor mode to '${msg.argcat}'.`;
            return `This command is being worked on.`;
        }, 4, true);

        this.addCommand("prefix", `&PREFIXprefix (prefix)`, 1, (msg, bot) => {
            if (msg.args[1] == prefix) return `Prefix cannot be '${prefix}' because of a conflict.`;
            this.prefix = msg.args[1];
            msgBox("Prefix Change", `Prefix changed to '${msg.args[1]}'.`);
            return `Prefix changed to "${this.prefix}".`;
        }, 1, false);

        this.addCommand("crown", `&PREFIXcrown`, 0, (msg, bot) => {
            if (client.isOwner()) {
                client.sendArray([{ m: "chown", id: msg.p.id }]);
                return `Giving ownership to ${msg.p.name}`;
            } else {
                return `no crown :(`;
            }
        }, 1, true);

        this.addCommand("rockpaperscissors", `&PREFIXrockpaperscissors (move)`, 1, (msg, bot) => {
            let move = msg.args[1].toLowerCase();
            let movearray = ["rock","paper","scissors"]
            let cpu = movearray[Math.floor(Math.random()*movearray.length)];
            if (movearray.indexOf(msg.argcat) == -1) return sendChat("That's not a move! List of legal moves: rock, paper, scissors");
            sendChat(`${msg.p.name}: ${move} | CPU: ${cpu}`);
            switch (move) {
                case "rock":
                    switch (cpu) {
                        case "rock":
                            sendChat("It was a tie!");
                            break;
                        case "paper":
                            sendChat("The CPU won!");
                            break;
                        case "scissors":
                            sendChat(msg.p.name + " won!");
                            break;
                    }
                    break;
                case "paper":
                    switch (cpu) {
                        case "paper":
                            sendChat("It was a tie!");
                            break;
                        case "scissors":
                            sendChat("The CPU won!");
                            break;
                        case "rock":
                            sendChat(msg.p.name + " won!");
                            break;
                    }
                    break;
                case "scissors":
                    switch (cpu) {
                        case "scissors":
                            sendChat("It was a tie!");
                            break;
                        case "rock":
                            sendChat("The CPU won!");
                            break;
                        case "paper":
                            sendChat(msg.p.name + " won!");
                            break;
                    }
                    break;
            }
        }, 0, false);

        this.addCommand('spank', `&PREFIXspank [user]`, 0, (msg, bot) => {
            if (!msg.args[1]) {
                return `${msg.p.name} spanked themselves.`;
            }
            let user = getPart(msg.argcat);
            if (!user || typeof user == 'undefined') return `Could not find user.`;
            return `${msg.p.name} spanked ${user.name}.`;
        }, 0 , true);
        
        this.addCommand('hit', `&PREFIXhit [user]`, 0, (msg, bot) => {
            if (!msg.args[1]) {
                return `${msg.p.name} slapped themselves, giving themselves a red mark.`;
            }
            let user = getPart(msg.argcat);
            if (!user || typeof user == 'undefined') return `Could not find user.`;
            return `${msg.p.name} hit ${user.name}.`;
        }, 0, true);

        this.addCommand('hug', `&PREFIXhug [user]`, 0, (msg, bot) => {
            let r = Math.random();
            let p = getPart(msg.argcat);
            if (r < 0.25) {
                return `${msg.p.name} hugged ${p.name} so hard, they passed out.`;
            } else {
                return `${msg.p.name} gave ${p.name} an affectionate hug.`
            }
        }, 0, false);

        this.addCommand('slap', `&PREFIXslap [user]`, 0, (msg, bot) => {
            let r = Math.random();
            let p = getPart(msg.argcat);
            if (r < 0.25) {
                return `${msg.p.name} slapped ${p.name} so hard, they passed out.`;
            } else {
                return `${msg.p.name} slapped ${p.name}.`
            }
        }, 0, true);
        
        this.addCommand('poke', `&PREFIXpoke [user]`, 0, (msg, bot) => {
            let r = Math.random();
            let p = getPart(msg.argcat);
            if (r < 0.25) {
                return `${msg.p.name} poked ${p.name} in the eye. (whoops!)`;
            } else {
                return `${msg.p.name} poked ${p.name}.`
            }
        }, 0, false);

        this.roomLove = 0;

        this.addCommand('pat', `&PREFIXpat [user]`, 0, (msg, bot) => {
            let r = Math.random();
            let p = getPart(msg.argcat);
            if (r < 0.25) {
                this.roomLove++;
                return `${msg.p.name} pats ${p.name} and a little bit of love is spread through the room.`;
            } else {
                return `${msg.p.name} pats ${p.name} on the head.`
            }
        }, 0, false);

        this.addCommand('repe', `&PREFIXrepe <message>`, 1, (msg, bot) => {
            let alpha = 'abceefrhijkpmnopqrstuvwxyz';
            let orig = 'abcdefghijklmnopqrstuvwxyz';
            let message = msg.argcat;
            let output = '';
            for (let i = 0; i < message.length; i++) {
                // replace orig chars with alpha chars
                if (message[i] == ' ') {
                    output += ' ';
                    continue;
                }
                let index = orig.indexOf(message[i]);
                if (index != -1) {
                    output += alpha[index];
                }
            }
            return output;
        }, 0, true);

        this.addCommand('geld', `&PREFIXgeld <message>`, 1, (msg, bot) => {
            let alpha = 'abcdefghijklmnopqrstuvwxyz';
            let orig = 'abceefrhijkpmnopqrstuvwxyz';
            let message = msg.argcat;
            let output = '';
            for (let i = 0; i < message.length; i++) {
                // replace orig chars with alpha chars
                if (message[i] == ' ') {
                    output += ' ';
                    continue;
                }
                let index = orig.indexOf(message[i]);
                if (index != -1) {
                    output += alpha[index];
                }
            }
            return output;
        }, 0, true);

        this.addCommand('shrug', `&PREFIXshrug`, 0, (msg, bot) => {
            if (!msg.args[1]) {
                return `${msg.p.name} shrugs. ¯\\_(ツ)_/¯`;
            } else {
                return `A shrug from ${msg.p.name}: ${msg.a} ¯\\_(ツ)_/¯`;
            }
        }, 0, false);

        this.addCommand('tableflip', `&PREFIXtableflip`, 0, (msg, bot) => {
            return `(╯°□°）╯︵ ┻━┻`;
        }, 0, true);

        this.addCommand('tableunflip', `&PREFIXtableunflip`, 0, (msg, bot) => {
            return `┬─┬ ノ( ゜-゜ノ)`;
        }, 0, true);
    }

    static addCommand(cmd, usage, minargs, func, minrank, hidden) {
        this.commands.push(new this.Command(cmd, usage, minargs, func, minrank, hidden));
    }

    static getUser(p) {
        let ids = Object.keys(this.userdata);
        let foundUser;

        ids.forEach(id => {
            let u = this.userdata[id];
            if (p._id == u._id) {
                foundUser = u;
            }
        });

        if (typeof(foundUser) == 'undefined') {
            foundUser = new this.User(p.name, p._id, p.color);
            this.userdata[p._id] = foundUser;
        }

        this.saveUserData();

        return foundUser;
    }

    static getRank(p) {
        let user = this.getUser(p);
        return user.rank;
    }

    static setRank(p, rank) {
        this.userdata[p._id].rank = rank;
    }

    static getRankByID(id) {
        switch (id) {
            case 0:
                return {name: "None", _id: 0};
                break;
            case 1:
                return {name: "Moderator", _id: 1};
                break;
            case 2:
                return {name: "Admin", _id: 2};
                break;
            case 3:
                return {name: "Godmin", _id: 3};
                break;
            case 4:
                return {name: "Owner", _id: 4};
                break;
        }
    }

    static getUsage(str) {
        return str.split('&PREFIX').join(this.prefix);
    }

    static saveUserData() {
        localStorage.setItem("hri-userdata", JSON.stringify(this.userdata));
    }

    static incrementCalls() {
        this.calls++;
        localStorage.setItem("hriCalls", JSON.stringify(this.calls));
    }

    static added = false;

    static addHTML() {
        if (this.added) return;
        this.addButtons();
        this.addModals();
        this.added = true;
    }

    static addButtons() {
        if (this.added) return;
        // $("#bottom .relative").append(`<div id="hri-bot-button" class="ugly-button translate">Bot Settings</div>`);
        // $("#hri-bot-button").css("position", "absolute").css("left", "780px").css("top", "4px");

        $("body").prepend(`<div id="side-menu"></div>`)

        $("#side-menu").css({
            width: '0',
            "z-index": 9999,
            right: '-1px',
            transition: "width .2s ease-in-out",
            height: "100vh",
            display: "block",
            "box-sizing": "inherit",
            position: "absolute",
            background: "#111",
            "backdrop-filter": this.theme.blurDisabled ? 'none' : `blur(${this.theme.blur}px)`,
            "border-left": "1px solid #444"
        });

        $("#bottom .relative").append(`
        <div id="side-menu-btn" class="ugly-button">Side Menu</div>
        `);

        $("#side-menu-btn").css({
            position: "absolute",
            right: '150px',
            top: '32px'
        });

        $("#side-menu-btn").on("click", evtn => {
            if (!enabled) {
                $("#side-menu").css({
                    "width": "256px"
                });
                enabled = true;
            } else {
                $("#side-menu").css({
                    "width": 0
                });
                enabled = false;
            }
        });

        // add side menu options
        $("#side-menu").append(`
            <div id="side-menu-options">
                <div id="side-menu-options-header" class="side-menu-header">
                    <div id="side-menu-options-header-text">Options</div>
                </div>
                <div id="side-menu-options-body">
                    <div id="side-menu-options-bot-settings" class="ugly-button side-menu-options-button">Bot Settings</div>
                </div>
            </div>
        `);

        function moveOtherButtons() {
            $("div[id$='-btn'].ugly-button").each((i, el) => {
                let regularButtons = [
                    "side-menu-btn",
                    "new-room-btn",
                    "room-settings-btn",
                    "record-btn",
                    "sound-btn",
                    "midi-btn",
                    "synth-btn",
                    "play-alone-btn",
                    
                    "client-settings-btn" // causes an issue when in the side menu
                ];
                if (!regularButtons.includes(el.id)) {
                    $(el).detach();
                    $(el).attr("id", `side-menu-options-${$(el).attr("id")}`);
                    $(el).addClass('side-menu-options-button');
                    $("#side-menu-options-body").append(el);
                }
            });
        }

        moveOtherButtons();

        // setInterval(() => {
        //     moveOtherButtons();
        // }, 60 * 1000);

        // $("#hri-bot-button").on("click", () => {
        //     this.openSettings();
        // });

        $("#side-menu-options-bot-settings").on("click", () => {
            this.openSettings();
        });

        // just a mute button

        // ==UserScript==
        // @name         Mute Piano Button
        // @namespace    http://tampermonkey.net/
        // @version      0.1
        // @description  try to take over the world!
        // @author       Hri7566
        // @match        https://mppclone.com/*
        // @icon         https://www.google.com/s2/favicons?domain=mppclone.com
        // @grant        none
        // ==/UserScript==

        window.cl = MPP.client;

        // let muteButton = `<div id="mute-btn" class="ugly-button">Mute Piano</div>`;
        let muteButton = `<div id="side-menu-options-mute-btn" class="ugly-button side-menu-options-button">Mute Piano</div>`;

        // $("#bottom .relative").append(muteButton);

        /*
        $("#mute-btn").css({
            position: 'absolute',
            right: '150px',
            top: '4px'
        });
        */

        $("#side-menu #side-menu-options #side-menu-options-body").append($(muteButton));

        $("#side-menu-options-mute-btn").on("click", toggleMute);
        
        let muted = false;
        function toggleMute() {
            if (muted) {
                $("#piano").fadeTo(1000, 1);
                $("#piano").css({
                    "z-index": "400"
                });
                $("#volume").fadeTo(1000, 1);
                $("#volume #volume-slider").prop("disabled", false);
                $("#side-menu-options-mute-btn").html("Mute Piano");
                gPiano.audio.masterGain.gain.value = parseFloat($("#volume #volume-slider").val());
                muted = false;
                localStorage.hriPianoMuted = false;
            } else {
                $("#piano").fadeTo(1000, 0.2);
                $("#piano").promise().done(() => {
                    $("#piano").css({
                        "z-index": "-400"
                    });
                });
                $("#volume").fadeTo(1000, 0.2);
                $("#volume #volume-slider").prop("disabled", true);
                $("#side-menu-options-mute-btn").html("Unmute Piano");
                gPiano.audio.masterGain.gain.value = 0;
                muted = true;
                localStorage.hriPianoMuted = true;
            }
        }

        if (localStorage.hriPianoMuted) {
            if (localStorage.hriPianoMuted) {
                if (localStorage.hriPianoMuted === "true") {
                    toggleMute();
                }
            }
        }

        let hideBgBtn = `<div id="side-menu-options-hide-bg-btn" class="ugly-button side-menu-options-button">Hide Background</div>`;

        let bgHidden = false;

        $("#side-menu-options-body").append($(hideBgBtn));

        function toggleBg() {
            if (!bgHidden) {
                $("#bg").fadeOut(250);
                $("#side-menu-options-hide-bg-btn").html("Show Background");
                bgHidden = true;
            } else {
                $("#bg").fadeIn(250);
                $("#side-menu-options-hide-bg-btn").html("Hide Background");
                bgHidden = false;
            }
            localStorage.hriPianoBgHidden = bgHidden;
        }

        $("#side-menu-options-hide-bg-btn").on("click", () => {
            toggleBg();
        });

        if (typeof localStorage.hriPianoBgHidden !== 'undefined') {
            if (localStorage.hriPianoBgHidden === "false") {
                toggleBg();
            }
        }

        let hideCursorButton = `<div id="side-menu-options-hide-cursor" class="ugly-button side-menu-options-button">Hide Cursor</div>`;

        $("#side-menu-options-body").append($(hideCursorButton));

        let cursorHidden = false;

        $("#side-menu-options-hide-cursor").on("click", () => {
            if (!cursorHidden) {
                $(gClient.getOwnParticipant().cursorDiv).fadeOut(250);
                $("#side-menu-options-hide-cursor").html("Show Cursor");
                cursorHidden = true;
            } else {
                $(gClient.getOwnParticipant().cursorDiv).fadeIn(250);
                $("#side-menu-options-hide-cursor").html("Hide Cursor");
                cursorHidden = false;
            }
            localStorage.hriPianoCursorHidden = cursorHidden;
        });

        if (typeof localStorage.hriPianoCursorHidden !== 'undefined') {
            if (localStorage.hriPianoCursorHidden === "true") {
                setTimeout(() => {
                    $(gClient.getOwnParticipant().cursorDiv).fadeOut(250);
                }, 1000);
                $("#side-menu-options-hide-cursor").html("Show Cursor");
                cursorHidden = true;
            }
        }

        let dataBtn = `<div id="side-menu-options-bot-data" class="ugly-button side-menu-options-button">Bot Data</div>`;

        $("#side-menu-options-body").append($(dataBtn));

        $("#side-menu-options-bot-data").on("click", () => {
            this.openData();
        });

        let closeBtn = `<div id="side-menu-options-close" class="ugly-button side-menu-options-button">Close Menu</div>`;

        $("#side-menu-options-body").append($(closeBtn));

        $("#side-menu-options-close").on("click", () => {
            $("#side-menu").css({
                "width": 0
            });
            enabled = false;
        });

        // style menu
        $("#side-menu-options-header").css({
            padding: "10px"
        });

        // style menu options
        $(".side-menu-options-button").css({
            "margin-left": "10px",
            "margin-right": "10px",
            "margin-top": "10px",
            "margin-bottom": "10px"
        });
    }

    static addModals() {
        if (this.added) return;
        $("#modals").append(`
            <div id="hri-bot-settings" class="dialog" style="display: none;">
                <p><label><input type="checkbox" name="enabled" class="checkbox"${this.enabled ? " checked" : ""}>Bot Enabled</label></p>
                <p><label>Theme color:  &nbsp;<input type="color" name="themecolor" placeholder="${this.theme.color}" maxlength="7" class="color"></label></p>
                <p><label>Blur amount (px):  &nbsp;<input type="number" name="blur" style="width: 50px;"></label></p>
                <p><label>&nbsp;<input type="checkbox" name="disableblur" class="checkbox"${this.theme.blurDisabled ? " checked" : ""}>Disable Blur</label></p>
                <button class="submit">APPLY</button>
            </div>
        `);

        $("#hri-bot-settings").css("height", "400px").css("margin-top", "-200px");

        $("#hri-bot-settings p label input[name='blur']").val(this.theme.blur);

        $("#hri-bot-settings .submit").click(evt => {
            var name = $("#new-room .text[name=name]").val();
            this.enabled = $("#hri-bot-settings input[name=enabled]").is(":checked") ? true : false;
            this.theme.color = new Color($("#hri-bot-settings input[name=themecolor]").val());
            this.theme.blurDisabled = $("#hri-bot-settings input[name=disableblur]").is(":checked");
            this.theme.blur = $("#hri-bot-settings input[name=blur]").val();
            this.updateTheme();
			closeModal();
        });

        $("#modals").append(`
            <div id="hri-bot-data" class="dialog" style="display: none;">
                <p class="total-users">Total users:</p>
                <select name="ids" id="id-list"></select>
                <button class="submit">CLOSE</button>
                <p class="data-name">Name:</p>
                <p class="data-id">ID:</p>
                <p class="data-color">Color:</p>
                <p class="data-rank">Rank:</p>
            </div>
        `);

        $("#hri-bot-data").css("height", "400px").css("margin-top", "-200px");

        $("#hri-bot-data .submit").click(evt => {
            closeModal();
        });
    }

    static openSettings() {
        openModal("#hri-bot-settings");
        setTimeout(() => {
            $("#hri-bot-settings input[name=enabled]").prop("checked", this.enabled);
            $("#hri-bot-settings input[name=themecolor]").val(this.theme.color.toHexa());
            $("#hri-bot-settings input[name=disableblur]").prop("checked", this.theme.blurDisabled);
        }, 250);
    }

    static openData() {
        openModal("#hri-bot-data");
        $("#hri-bot-data select").html("");

        let count = 0;

        for (let id of Object.keys(this.userdata)) {
            count++;
            $("#hri-bot-data select").append(`<option value="${id}">${id}</option>`);
        }

        $("#hri-bot-data .total-users").html("Total users: " + count);

        $("#hri-bot-data select").change(evt => {
            let id = $("#hri-bot-data select").val();
            if (id === "") return;
            let data = this.userdata[id];
            $("#hri-bot-data .data-name").html("Name: " + data.name);
            $("#hri-bot-data .data-id").html("ID: " + id);
            $("#hri-bot-data .data-color").html("Color: " + new Color(data.color).toHexa());
            $("#hri-bot-data .data-rank").html("Rank: " + data.rank.name);
        });
    }

    static updateTheme() {
        let hex = this.theme.color.toHexa();
        let darkened = new Color(this.theme.color.toHexa());
        darkened.r -= 20;
        if (darkened.r < 0) darkened.r = 0;
        darkened.g -= 20;
        if (darkened.g < 0) darkened.g = 0;
        darkened.b -= 20;
        if (darkened.b < 0) darkened.b = 0;

        $("#modal .bg").css("background", hex + '44');
        $("#modal #modals .dialog").css("background", hex + '88').css("border", "2px solid " + darkened.toHexa() + '88');
        $(".ugly-button").css("background", hex + '44').css("border", "2px solid " + darkened.toHexa() + '44');

        if (this.theme.blurDisabled == false) {
            $("#modal .bg").css("backdrop-filter", `blur(${this.theme.blur}px)`);
            $("#modal #modals .dialog").css("backdrop-filter", `blur(${this.theme.blur}px)`);
            $(".ugly-button").css("backdrop-filter", `blur(${this.theme.blur}px)`);
            $("#side-menu").css("backdrop-filter", `blur(${this.theme.blur}px)`);
        } else {
            $("#modal .bg").css("backdrop-filter", "none");
            $("#modal #modals .dialog").css("backdrop-filter", "none");
            $(".ugly-button").css("backdrop-filter", "none");
            $("#side-menu").css("backdrop-filter", "none");
        }

        $("#side-menu").css({
            background: hex + '44',
            "border-left": "1px solid " + darkened.toHexa() + '44'
        });

        localStorage.setItem("hriThemeColor", this.theme.color.toHexa());
        localStorage.setItem("hriThemeBlur", this.theme.blur);
        localStorage.setItem("hriThemeBlurDisabled", this.theme.blurDisabled);
    }

    static handleSpeechRecognition() { // speech synthesis from the keeper of A T L A S (written by Yoshify)
        function capitalizeFirstLetter(string) {
            return string.trim();
        }

        window.Voice = new webkitSpeechRecognition();

        Voice.lang = 'en';

        var listening = true;
        Voice.continuous = true;
        Voice.interimResults = true;

        Voice.start();

        Voice.onend = () => {
            Voice.start();
        }

        Voice.onresult = (event) => {
            if (event.results.length > 0) {
                var result = event.results[event.results.length - 1];
                if (result.isFinal) {
                    let str = capitalizeFirstLetter(result[result.length - 1].transcript).toLowerCase();
                    if (str.startsWith(this.voiceKeyword)) {
                        this.handleSpecialCmd(str);
                    }
                    // if (!str.startsWith(this.voiceKeyword)) {
                        if (this.chatEnabled) {
                            MPP.chat.send(str);
                        }
                    // } else {
                        // this.handleSpecialCmd(str);
                    // }
                }
            }
        }

        function handleKeyDown(evt) {
            if ($("#chat").hasClass("chatting")) return;
            var code = parseInt(evt.keyCode);
            // if (code == 220) { //Yoshify's speech to text
            if (code == 192) {
                if (listening) {
                    listening = false;
                    Voice.onend = () => {};
                    Voice.stop();
                    msgBox('Speech to Text', 'Stopping Capture');
                } else {
                    listening = true;
                    Voice.start();
                    Voice.onend = () => {
                        Voice.start();
                    }
                    msgBox('Speech to Text', 'Listening');
                }
            }
            if (code == 13 || code == 27) {
                // somehow adding this fixes a problem with chat focus
            }
        }

        $(document).on("keydown", handleKeyDown);
    }

    static handleSpecialCmd(str) {
        let args = str.split(' ');
        let cmd = args[1];
        let argcat = str.substring(args[0].length + cmd.length + 1).trim();
        if (args.length < 2) return;
        if (cmd == 'fish') {
            MPP.chat.send("/fish");
        }
        if (cmd == 'real' || cmd == 'reel') {
            MPP.chat.send("/reel");
        }
        if (cmd == 'eat') {
            MPP.chat.send("/eat");
        }
        if (cmd == "change" || cmd == "set") {
            if (argcat.includes("keyword")) {
                this.voiceKeyword = args[args.length - 1];
                msgBox("Voice Keyword Changed", "Voice keyword has changed to " + this.voiceKeyword + ".");
            }
            if (argcat.includes("name")) {
                MPP.client.sendArray([{
                    m: 'userset',
                    set: {
                        name: args[args.length - 1]
                    }
                }]);
                msgBox("Name Changed", "Name has been changed to " + args[args.length - 1] + ".");
            }
            if (argcat.includes("color")) {
                MPP.client.sendArray([{
                    m: 'userset',
                    set: {
                        color: args[args.length - 1]
                    }
                }]);
                msgBox("Color Changed", "Color has been changed to " + args[args.length - 1] + ".");
            }
        }
        if (cmd == "reset") {
            if (argcat.includes("color")) {
                if (MPP.client.getOwnParticipant().color !== "#08E8DE") {
                    MPP.client.sendArray([{
                        m: 'userset', 
                        set: {
                            color:"#08E8DE"
                        }
                    }]);
                }
            }
            if (argcat.includes("name")) {
                if (MPP.client.getOwnParticipant().name !== "๖ۣۜH͜r̬i͡7566") {
                    MPP.client.sendArray([{m:'userset', set:{name: "๖ۣۜH͜r̬i͡7566"}}]);
                }
            }
            if (argcat.includes("keyword")) {
                this.voiceKeyword = "computer";
                msgBox("Voice Keyword Changed", "Voice keyword has changed to " + this.voiceKeyword + ".");
            }
        }
        if (cmd == "cursor") {
            if (argcat.includes("on")) {
                this.cursor.enabled = true;
                console.log('cursor on');
            } else if (argcat.includes("off")) {
                this.cursor.enabled = false;
                console.log('cursor off');
            }
        }
        if (cmd == "chat") {
            if (argcat.includes("on")) {
                this.chatEnabled = true;
            } else if (argcat.includes("off")) {
                this.chatEnabled = false;
            }
        }
        // if (cmd == "ai") {
        //     if (argcat) {
        //         this.cleverbotWS.send(argcat);
        //     }
        // }
        if (cmd == "mute") {
            MPP.piano.audio.setVolume(0);
        }
        if (cmd == "unmute") {
            MPP.piano.audio.setVolume(0.16);
        }
        if (cmd == "chicken" || cmd == "chimken") {
            if (MPP.client.getOwnParticipant().name !== "chimken birb") {
                MPP.client.sendArray([{m:'userset', set:{name: "chimken birb"}}]);
            }
            if (MPP.client.getOwnParticipant().color !== "#FFFF00") {
                MPP.client.sendArray([{m:'userset', set:{color:"#FFFF00"}}]);
            }
        }
    }

    static mx;
    static my;

    static startCursor() {
        let part = MPP.client.getOwnParticipant();
        let div = document.createElement("div");
        div.className = "cursor";
        div.style.display = "none";
        part.cursorDiv = $("#cursors")[0].appendChild(div);
        $(part.cursorDiv).fadeIn(2000);

        div = document.createElement("div");
        div.className = "name";
        div.style.backgroundColor = part.color || "#777"
        div.textContent = part.name || "";
        part.cursorDiv.appendChild(div);

        client.on("participant added", p => {
            // replace image
            $(p.cursorDiv).css({
                "background-image": "url(https://www.pianorhythm.me/images/icons/cursors/x1/default.png)"
            });
        });

        for (let p of Object.values(gClient.ppl)) {
            // replace image
            $(p.cursorDiv).css({
                "background-image": "url(https://www.pianorhythm.me/images/icons/cursors/x1/default.png)"
            });
        }

        client.on("ch", () => {
            // remove old cursors
            for (let p of Object.values(MPP.client.ppl)) {
                if (p.cursorDiv && p._id == MPP.client.getOwnParticipant()._id) {
                    $(p.cursorDiv).remove();
                }

                // replace image
                $(p.cursorDiv).css({
                    "background-image": "url(https://www.pianorhythm.me/images/icons/cursors/x1/default.png)"
                });
            }

            $("#cursors .cursor .name").each((i, n) => {
                let name = $(n).text();
                if (name == "") $(n).parent().remove();
            });

            // add new cursor
            let part = MPP.client.getOwnParticipant();
            let div = document.createElement("div");
            div.className = "cursor";
            div.style.display = "none";
            part.cursorDiv = $("#cursors")[0].appendChild(div);
            $(part.cursorDiv).fadeIn(2000);

            $(part.cursorDiv).css({
                "background-image": "url(https://www.pianorhythm.me/images/icons/cursors/x1/default.png)"
            });

            div = document.createElement("div");
            div.className = "name";
            div.style.backgroundColor = part.color || "#777"
            div.textContent = part.name || "";
            part.cursorDiv.appendChild(div);
        });

        // remove old mouse movement
        $(document).unbind("mousemove");

        // add own mouse movement
        $(document).mousemove(evt => {
            // setTimeout(() => {
                if (this.cursor.enabled) return;
                this.mx = ((evt.pageX / $(window).width()) * 100).toFixed(2);
                this.my = ((evt.pageY / $(window).height()) * 100).toFixed(2);
                this.setCursor(this.mx, this.my);
            // }, 1000);
        });
        
        this.cursorMessageInterval = setInterval(() => {
            client.sendArray([{
                m: 'm',
                x: this.cursor.x,
                y: this.cursor.y
            }]);
        }, 1000 / 20);

        let ot = Date.now();
        let t = Date.now();
        let dt = t - ot;

        this.cursorFunctionInterval = setInterval(() => {
            t = Date.now();
            dt = t - ot;
            if (!this.cursor.enabled) return;

            this.mx += this.mx * dt;
            this.my += this.my * dt;

            if (this.mx < 0 || this.mx > 100) {
                this.cursor.vel.x *= -1;
            }
            
            if (this.my < 0 || this.my > 100) {
                this.my *= -1;
            }

            this.setCursor(this.mx, this.my);

            ot = Date.now();
        }, 1000 / 60);
    }

    static updateOwnCursor() {
        let div = MPP.client.getOwnParticipant().cursorDiv;
        div.style.left = this.mx + "%";
        div.style.top = this.my + "%";
    }

    static setCursor(x, y) {
        this.cursor.pos.x = x;
        this.cursor.pos.y = y;
        this.updateOwnCursor();
    }

    static [Symbol.toPrimitive](hint) {
        return `whatever you're trying has to be bad, i prefer ${new Color(window.client.getOwnParticipant().color).getName().toString()} instead`;
    }
}

setTimeout(() => {
    Bot.start(client)
    window.Bot = Bot;
    MPP.Bot = Bot;
}, 1000);

let enabled = false;












let mute = true;
MPP.client.sendArray([{ m: "+custom" }]);

// window.msgBox = (title, text, html) => {
//     new MPP.Notification({
//         id: "hri-bot-msg",
//         title: title,
//         text: text,
//         target: "#piano",
//         duration: 7000,
//         html: html
//     });
// }

let a;

let audioIN = { audio: true };

    navigator.mediaDevices.getUserMedia({ audio: true })

      .then(function(mediaStreamObj) {

        document.addEventListener("keypress", evt => {
            if (evt.key == "\\") {
                if (mute == true) {
                    msgBox("Voice Chat", "Voice chat is now enabled.");
                    a = setInterval(() => {
                        let mediaRecorder = new MediaRecorder(mediaStreamObj);
                        mediaRecorder.start();
                        mediaRecorder.ondataavailable = function(ev) {
                            var reader = new FileReader();
                            reader.readAsDataURL(ev.data);
                            reader.onloadend = function() {
                                var base64data = reader.result;                
                                MPP.client.sendArray([{ m: "custom", data: { m: "vc", "vcData": base64data.toString() }, target: { mode: "subscribed", global: false } }]);
                            }
                            // if (mediaRecorder.state == "recording") mediaRecorder.stop();
                        }
                        setTimeout(() => {
                            mediaRecorder.stop();
                        }, 1050);
                    }, 1000);
                    mute = false;
                } else if (mute == false) {
                    msgBox("Voice Chat", "Voice chat is now disabled.");
                    clearInterval(a);
                    // mediaRecorder.stop();
                    mute = true;
                }
            }
        });

        let dataArray = [];
      })

      // If any error occurs then handles the error
      .catch(function(err) {
        console.error(err);
      });

      $(document).ready(() => {
        setTimeout(() => {
            MPP.client.sendArray([{m: "+custom"}]);
        }, 3000);
    
        MPP.client.on("custom", cu => {
            if (cu.p == MPP.client.getOwnParticipant()._id) return;
    
            // play audio from msg
            if (!('m' in cu)) {
                return;
            }
    
            let msg = cu.data;
    
            if (msg.m == "vc") {
                // convert msg.vcData from string to blob
                let audio = new Audio(msg.vcData);
                
                // play audio when loaded
                audio.addEventListener('loadeddata', () => {
                    audio.play();
                });
            }
        });
    });


// spinning donut lol
// nvm i made it an icosahedron instead

// ==UserScript==
// @name         GridUI (unfinished)
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Theme for MPP
// @author       Hri7566
// @match        https://mppclone.com/*
// @match        https://www.multiplayerpiano.org/*
// @icon         https://www.google.com/s2/favicons?domain=mppclone.com
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
// @require      https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/loaders/GLTFLoader.js
// @copyright    2022+
// ==/UserScript==

$("body").prepend(`<canvas id="bg"></canvas>`);

$("#bg").css({
    position: 'fixed',
    top: 0,
    left: 0
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    alpha: true
});

const loader = new THREE.GLTFLoader();
// const geometry = new THREE.TorusGeometry(10, 3, 8, 50);
const geometry = new THREE.IcosahedronGeometry(100, 0);
const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xffffff,
    emissiveIntensity: 1,
    roughness: 0.5,
    metalness: 0.5
});
const mesh = new THREE.Mesh(geometry, material);
const amblight = new THREE.AmbientLight(0xffffff);

let animating = false;

material.wireframe = true;

window.addEventListener("resize", function() {
    // https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
});

const start = () => {

    if (animating) return;
    animating = true;

    if (typeof localStorage.hriPianoBgHidden !== 'undefined') {
        if (localStorage.hriPianoBgHidden == 'true') {
            $("#bg").fadeIn(5000);
        }
    } else {
        $("#bg").fadeIn(5000);
    }
    
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    // renderer.setClearColor(0x000000, 1);

    // camera.position.setZ(50);

    scene.add(amblight);
    scene.add(mesh);

    const animate = () => {
        // torus.rotation.x += 0.01;
        // mesh.rotation.y += 0.005;
        // mesh.rotation.z += 0.0025;
        mesh.rotation.y += 0.001;
        mesh.rotation.z += 0.0005;

        renderer.render(scene, camera);
        $("#bottom").css({
            background: 'none'
        });
        requestAnimationFrame(animate);
    }

    animate();
}

$("#bg").fadeOut(1);
setTimeout(() => {
    start();
    // checkForUglyButtons();
}, 2500);

const updateColor = () => {
    let c = parseInt(MPP.client.channel.settings.color.substring(1), 16);
    if (c == 0 || typeof c == 'undefined') c = 0xffffff;
    // material.color.setHex(c);
    // light.color.setHex(c);
    material.emissive.setHex(c);

    if ('color2' in MPP.client.channel.settings) {
        let c2 = parseInt(MPP.client.channel.settings.color2.substring(1), 16);
        if (c2 == 0 || typeof c2 == 'undefined') c2 = 0xffffff;
        // light.color.setHex(c2);
        material.color.setHex(c2);

        // renderer.setClearColor(c2, 1);
    } else {
        // subtract 64 from each RGB but without integer underflow
        let r = c >> 16;
        let g = c >> 8 & 0xFF;
        let b = c & 0xFF;

        r = r - 64 > 0 ? r - 64 : 0;
        g = g - 64 > 0 ? g - 64 : 0;
        b = b - 64 > 0 ? b - 64 : 0;

        // renderer.setClearColor(r << 16 | g << 8 | b, 1);
    }
}

MPP.client.on("ch", () => {
    updateColor();
});

let buttonRenderers = [];

const checkForUglyButtons = () => {
    let buttons = $(".ugly-button");

    $(buttons).each((i, btn) => {
        setupButton(btn);
    });
}

const setupButton = btn => {
    $(btn).css({
        "background": "none",
        "border": "none"
    });

    let text = $(`<p>${$(btn).text()}</p>`);
    $(btn).text("");

    let canv = $("<canvas></canvas>");

    $(btn).append(text);
    $(btn).append(canv);
}

















// > eval

// ==UserScript==
// @name         Emoji Eval
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mpp.hri7566.info/*
// @match        https://mppclone.com/*
// @match        https://www.multiplayerpiano.net/*
// @match        https://www.multiplayerpiano.org/*
// @grant        none
// ==/UserScript==

var emojis = [
	'😄','😃','😀','😊','☺','😉','😍','😘','😚','😗','😙','😜','😝','😛','😳','😁','😔','😌','😒','😞','😣','😢','😂','😭','😪','😥','😰','😅','😓','😩','😫','😨','😱','😠','😡','😤','😖','😆','😋','😷','😎','😴','😵','😲','😟','😦','😧','😈','👿','😮','😬','😐','😕','😯','😶','😇','😏','😑','👲','👳','👮','👷','💂','👶','👦','👧','👨','👩','👴','👵','👱','👼','👸','😺','😸','😻','😽','😼','🙀','😿','😹','😾','👹','👺','🙈','🙉','🙊','💀','👽','💩','🔥','✨','🌟','💫','💥','💢','💦','💧','💤','💨','👂','👀','👃','👅','👄','👍','👎','👌','👊','✊','✌','👋','✋','👐','👆','👇','👉','👈','🙌','🙏','☝','👏','💪','🚶','🏃','💃','👫','👪','👬','👭','💏','💑','👯','🙆','🙅','💁','🙋','💆','💇','💅','👰','🙎','🙍','🙇','🎩','👑','👒','👟','👞','👡','👠','👢','👕','👔','👚','👗','🎽','👖','👘','👙','💼','👜','👝','👛','👓','🎀','🌂','💄','💛','💙','💜','💚','❤','💔','💗','💓','💕','💖','💞','💘','💌','💋','💍','💎','👤','👥','💬','👣','💭','🐶','🐺','🐱','🐭','🐹','🐰','🐸','🐯','🐨','🐻','🐷','🐽','🐮','🐗','🐵','🐒','🐴','🐑','🐘','🐼','🐧','🐦','🐤','🐥','🐣','🐔','🐍','🐢','🐛','🐝','🐜','🐞','🐌','🐙','🐚','🐠','🐟','🐬','🐳','🐋','🐄','🐏','🐀','🐃','🐅','🐇','🐉','🐎','🐐','🐓','🐕','🐖','🐁','🐂','🐲','🐡','🐊','🐫','🐪','🐆','🐈','🐩','🐾','💐','🌸','🌷','🍀','🌹','🌻','🌺','🍁','🍃','🍂','🌿','🌾','🍄','🌵','🌴','🌲','🌳','🌰','🌱','🌼','🌐','🌞','🌝','🌚','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌜','🌛','🌙','🌍','🌎','🌏','🌋','🌌','🌠','⭐','☀','⛅','☁','⚡','☔','❄','⛄','🌀','🌁','🌈','🌊','🎍','💝','🎎','🎒','🎓','🎏','🎆','🎇','🎐','🎑','🎃','👻','🎅','🎄','🎁','🎋','🎉','🎊','🎈','🎌','🔮','🎥','📷','📹','📼','💿','📀','💽','💾','💻','📱','☎','📞','📟','📠','📡','📺','📻','🔊','🔉','🔈','🔇','🔔','🔕','📢','📣','⏳','⌛','⏰','⌚','🔓','🔒','🔏','🔐','🔑','🔎','💡','🔦','🔆','🔅','🔌','🔋','🔍','🛁','🛀','🚿','🚽','🔧','🔩','🔨','🚪','🚬','💣','🔫','🔪','💊','💉','💰','💴','💵','💷','💶','💳','💸','📲','📧','📥','📤','✉','📩','📨','📯','📫','📪','📬','📭','📮','📦','📝','📄','📃','📑','📊','📈','📉','📜','📋','📅','📆','📇','📁','📂','✂','📌','📎','✒','✏','📏','📐','📕','📗','📘','📙','📓','📔','📒','📚','📖','🔖','📛','🔬','🔭','📰','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎹','🎻','🎺','🎷','🎸','👾','🎮','🃏','🎴','🀄','🎲','🎯','🏈','🏀','⚽','⚾','🎾','🎱','🏉','🎳','⛳','🚵','🚴','🏁','🏇','🏆','🎿','🏂','🏊','🏄','🎣','☕','🍵','🍶','🍼','🍺','🍻','🍸','🍹','🍷','🍴','🍕','🍔','🍟','🍗','🍖','🍝','🍛','🍤','🍱','🍣','🍥','🍙','🍘','🍚','🍜','🍲','🍢','🍡','🍳','🍞','🍩','🍮','🍦','🍨','🍧','🎂','🍰','🍪','🍫','🍬','🍭','🍯','🍎','🍏','🍊','🍋','🍒','🍇','🍉','🍓','🍑','🍈','🍌','🍐','🍍','🍠','🍆','🍅','🌽','🏠','🏡','🏫','🏢','🏣','🏥','🏦','🏪','🏩','🏨','💒','⛪','🏬','🏤','🌇','🌆','🏯','🏰','⛺','🏭','🗼','🗾','🗻','🌄','🌅','🌃','🗽','🌉','🎠','🎡','⛲','🎢','🚢','⛵','🚤','🚣','⚓','🚀','✈','💺','🚁','🚂','🚊','🚉','🚞','🚆','🚄','🚅','🚈','🚇','🚝','🚋','🚃','🚎','🚌','🚍','🚙','🚘','🚗','🚕','🚖','🚛','🚚','🚨','🚓','🚔','🚒','🚑','🚐','🚲','🚡','🚟','🚠','🚜','💈','🚏','🎫','🚦','🚥','⚠','🚧','🔰','⛽','🏮','🎰','♨','🗿','🎪','🎭','📍','🚩','⬆','⬇','⬅','➡','🔠','🔡','🔤','↗','↖','↘','↙','↔','↕','🔄','◀','▶','🔼','🔽','↩','↪','ℹ','⏪','⏩','⏫','⏬','⤵','⤴','🆗','🔀','🔁','🔂','🆕','🆙','🆒','🆓','🆖','📶','🎦','🈁','🈯','🈳','🈵','🈴','🈲','🉐','🈹','🈺','🈶','🈚','🚻','🚹','🚺','🚼','🚾','🚰','🚮','🅿','♿','🚭','🈷','🈸','🈂','Ⓜ','🛂','🛄','🛅','🛃','🉑','㊙','㊗','🆑','🆘','🆔','🚫','🔞','📵','🚯','🚱','🚳','🚷','🚸','⛔','✳','❇','❎','✅','✴','💟','🆚','📳','📴','🅰','🅱','🆎','🅾','💠','➿','♻','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⛎','🔯','🏧','💹','💲','💱','©','®','™','〽','〰','🔝','🔚','🔙','🔛','🔜','❌','⭕','❗','❓','❕','❔','🔃','🕛','🕧','🕐','🕜','🕑','🕝','🕒','🕞','🕓','🕟','🕔','🕠','🕕','🕖','🕗','🕘','🕙','🕚','🕡','🕢','🕣','🕤','🕥','🕦','✖','➕','➖','➗','♠','♥','♣','♦','💮','💯','✔','☑','🔘','🔗','➰','🔱','🔲','🔳','◼','◻','◾','◽','▪','▫','🔺','⬜','⬛','⚫','⚪','🔴','🔵','🔻','🔶','🔷','🔸','🔹'
];

window.getRandomEmoji = () => {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

MPP.client.on("a", msg => {
    if (!msg.a.startsWith(">")) return;
    if (msg.p._id !== MPP.client.getOwnParticipant()._id) return;
    let argcat = msg.a.substring(1);
    let out = "";
    try {
        out = `${getRandomEmoji()} ` + eval(argcat);
    } catch (err) {
        out = `❌ ` + err;
    }
    MPP.client.sendArray([{m: 'a', message: out}]);
})


















// new piano renderer


// get old stuff so we don't have to make it again
let old_audio_context = MPP.piano.audio;

MPP.oldPiano = MPP.piano;
delete MPP.piano;

// get rid of this big annoying block of cheese
$("#piano canvas").remove();

let gAutoSustain = false;
let gSustain = false;
let gHeldNotes = {};
let gSustainedNotes = {};

function handleKeyDown(evt) {
    let code = parseInt(evt.keyCode);
    if(gPiano.key_binding[code] !== undefined) {
        var binding = gPiano.key_binding[code];
        if(!binding.held) {
            binding.held = true;

            var note = binding.note;
            var octave = 1 + note.octave + transpose_octave;
            if(evt.shiftKey) ++octave;
            else if(capsLockKey || evt.ctrlKey) --octave;
            note = note.note + octave;
            var vol = velocityFromMouseY();
            press(note, vol);
        }

        if(++gKeyboardSeq == 3) {
            gKnowsYouCanUseKeyboard = true;
            if(window.gKnowsYouCanUseKeyboardTimeout) clearTimeout(gKnowsYouCanUseKeyboardTimeout);
            if(localStorage) localStorage.knowsYouCanUseKeyboard = true;
            if(window.gKnowsYouCanUseKeyboardNotification) gKnowsYouCanUseKeyboardNotification.close();
        }

        evt.preventDefault();
        evt.stopPropagation();
        return false;
    } else if (code == 8) {
        gAutoSustain = !gAutoSustain;
        evt.preventDefault();
    } else if (code === 0x20) {
        pressSustain();
        evt.preventDefault();
    }
}

function captureKeyboard() {
    // $("#piano").off("mousedown", recapListener);
    // $("#piano").off("touchstart", recapListener);
    $(document).on("keydown", handleKeyDown );
    // $(document).on("keyup", handleKeyUp);
    // $(window).on("keypress", handleKeyPress );
};

function releaseKeyboard() {
    $(document).off("keydown", handleKeyDown );
    // $(document).off("keyup", handleKeyUp);
    // $(window).off("keypress", handleKeyPress );
    // $("#piano").on("mousedown", recapListener);
    // $("#piano").on("touchstart", recapListener);
};

// captureKeyboard();

const DEFAULT_VELOCITY = 0.5;
const TIMING_TARGET = 1000;

const gClient = MPP.client;
const gNoteQuota = MPP.noteQuota;

globalThis.gHeldNotes = [];
globalThis.gSustainedNotes = [];

function press(id, vol) {
    if (!gClient.preventsPlaying() && gNoteQuota.spend(1)) {
        gHeldNotes[id] = true;
        gSustainedNotes[id] = true;
        gPiano.play(id, vol !== undefined ? vol : DEFAULT_VELOCITY, gClient.getOwnParticipant(), 0);
        // gClient.startNote(id, vol);
    }
}

function release(id) {
    if (gHeldNotes[id]) {
        gHeldNotes[id] = false;
        if ((gAutoSustain || gSustain) && !enableSynth) {
            gSustainedNotes[id] = true;
        } else {
            if (gNoteQuota.spend(1)) {
                gPiano.stop(id, gClient.getOwnParticipant(), 0);
                // gClient.stopNote(id);
                gSustainedNotes[id] = false;
            }
        }
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x2 = x + w;
        this.y2 = y + h;
    }

    contains(x, y) {
        return x >= this.x && x <= this.x2 && y >= this.y && y <= this.y2;
    }
}

class Renderer {
    init(piano) {
        this.piano = piano;
        this.resize();
        return this;
    }

    resize(width, height) {
        if (typeof width == 'undefined') {
            width = $(this.piano.rootElement).width();
        }

        if (typeof height == 'undefined') {
            height = $(this.piano.rootElement).height();
        }
        
        $(this.piano.rootElement).css({
            height: `${height}px`,
            marginTop: `${Math.floor($(window).height() / 2 - height / 2)}px`
        });

        this.width = width;
        this.height = height;

        return this;
    }
}

class CanvasRenderer extends Renderer {
    init(piano) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        piano.rootElement.appendChild(this.canvas);
        super.init(piano);

        let render = () => {
            this.redraw();
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);

        let mouse_down = false;
        let last_key = null;

        $(piano.rootElement).mousedown(event => {
            mouse_down = true;
            event.preventDefault();

            let pos = CanvasRenderer.translateMouseEvent(event);
            let hit = this.getHit(pos.x, pos.y);

            if (hit) {
                press(hit.key.note, hit.v);
                last_key = hit.key;
            }
        });

        piano.rootElement.addEventListener("touchstart", event => {
            mouse_down = true;
            event.preventDefault();

            for (let i in event.changedTouches) {
                let pos = CanvasRenderer.translateTouchEvent(event.changedTouches[i]);
                let hit = this.getHit(pos.x, pos.y);

                if (hit) {
                    press(hit.key.note, hit.v);
                    last_key = hit.key;
                }
            }
        }, false);

        $(window).mouseup(event => {
            if (last_key) {
                release(last_key.note);
            }
            mouse_down = false;
            last_key = null;
        });

        return this;
    }

    resize(width, height) {
        super.resize(width, height);

        if (this.width < 52 * 2) {
            this.width = 52 * 2;
        }
        if (this.height < this.width * 0.2) {
            this.height = Math.floor(this.width * 0.2);
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.canvas.style.width = this.width / window.devicePixelRatio + 'px';
        this.canvas.style.height = this.height / window.devicePixelRatio + 'px';

        this.whiteKeyWidth = Math.floor(this.width / 52);
        this.whiteKeyHeight = Math.floor(this.height * 0.9);

        this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.75);
        this.blackKeyHeight = Math.floor(this.height * 0.5);
        this.blackKeyOffset = Math.floor(this.whiteKeyWidth - (this.blackKeyWidth / 2));

        this.keyMovement = Math.floor(this.whiteKeyHeight * 0.015);

        this.whiteBlipWidth = Math.floor(this.whiteKeyWidth * 0.7);
        this.whiteBlipHeight = Math.floor(this.whiteBlipWidth * 0.8);

        this.whiteBlipX = Math.floor((this.whiteKeyWidth - this.whiteBlipWidth) / 2);
        this.whiteBlipY = Math.floor(this.whiteKeyHeight - this.whiteBlipHeight * 1.2 - (0.05 * this.whiteKeyHeight));

        this.blackBlipWidth = Math.floor(this.blackKeyWidth * 0.7);
        this.blackBlipHeight = Math.floor(this.blackBlipWidth * 0.8);
        
        this.blackBlipX = Math.floor((this.blackKeyWidth - this.blackBlipWidth) / 2);
        this.blackBlipY = Math.floor(this.blackKeyHeight - this.blackBlipHeight * 1.2 - (0.05 * this.blackKeyHeight));

        this.whiteKeyRender = document.createElement("canvas");
        this.whiteKeyRender.width = this.whiteKeyWidth;
        this.whiteKeyRender.height = this.height + 10;

        let ctx = this.whiteKeyRender.getContext('2d');

        if (ctx.createLinearGradient) {
            let gradient = ctx.createLinearGradient(0, 0, 0, this.whiteKeyHeight);
            gradient.addColorStop(0, '#eee');
            gradient.addColorStop(0.75, '#fff');
            gradient.addColorStop(0.95, '#aaa');
            gradient.addColorStop(0.95, '#888');
            gradient.addColorStop(1, '#888');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#ffffffcc';
        }

        ctx.strokeStyle = "#444";
        // ctx.lineJoin = "round";
        // ctx.lineCap = "round";

        // ctx.lineWidth = 10;
        ctx.lineWidth = 0;
        ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);

        ctx.lineWidth = 2;
        ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);

        this.blackKeyRender = document.createElement('canvas');
        this.blackKeyRender.width = this.blackKeyWidth + 10;
        this.blackKeyRender.height = this.blackKeyHeight + 10;

        ctx = this.blackKeyRender.getContext('2d');

        if (ctx.createLinearGradient) {
            let gradient = ctx.createLinearGradient(0, 0, 0, this.blackKeyHeight);
            gradient.addColorStop(0, '#444');
            gradient.addColorStop(0.95, '#444');
            gradient.addColorStop(0.95, '#333');
            gradient.addColorStop(1, '#333');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#444';
        }

        ctx.strokeStyle = "#222";
        // ctx.lineJoin = "round";
        // ctx.lineCap = "round";

        // ctx.lineWidth = 8;
        ctx.lineWidth = 0;
        // ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);

        ctx.lineWidth = 4;
        ctx.fillRect(ctx.lineWidth / 2, (ctx.lineWidth / 2) - 1, this.blackKeyWidth - ctx.lineWidth, (this.blackKeyHeight - ctx.lineWidth) + 1);

        this.shadowRender = [];
        let y = -this.canvas.height * 2;
        
        for (let j = 0; j < 2; j++) {
            let canvas = document.createElement('canvas');
            this.shadowRender[j] = canvas;
            
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;

            let ctx = canvas.getContext('2d');
            let sharp = j ? true : false;

            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = 1;
            ctx.lineWidth = 0;
            ctx.filter = "blur(10px)";
            
            ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
            ctx.shadowBlur = this.keyMovement * 3;
            ctx.shadowOffsetY = -y + this.keyMovement;
            
            if (sharp) {
                ctx.shadowOffsetX = this.keyMovement;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            } else {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = -y + this.keyMovement;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            }

            for (let i in this.piano.keys) {
                if (!this.piano.keys.hasOwnProperty(i)) continue;

                let key = this.piano.keys[i];
                if (key.sharp !== sharp) continue;

                if (key.sharp) {
                    // ctx.fillRect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2, y + ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
                } else {
                    ctx.fillRect(this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2, y + ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
                    ctx.drawImage(canvas,
                        this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2, y + ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth,
                        this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2, y + ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth
                    );
                }
            }
        }

        for (let i in this.piano.keys) {
            if (!this.piano.keys.hasOwnProperty(i)) continue;

            let key = this.piano.keys[i];
            if (key.sharp) {
                key.rect = new Rect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial, 0, this.blackKeyWidth, this.blackKeyHeight);
            } else {
                key.rect = new Rect(this.whiteKeyWidth * key.spatial, 0, this.whiteKeyWidth, this.whiteKeyHeight);
            }
        }
    }

    visualize(key, color) {
        key.timePlayed = Date.now();
        key.blips.push({
            "time": key.timePlayed,
            "color": color
        });
    }

    redraw() {
        let now = Date.now();
        let timeLoadedEnd = now - 1000;
        let timePlayedEnd = now - 100;
        let timeBlipEnd = now - 1000;

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let j = 0; j < 2; j++) {
            this.ctx.globalAlpha = 1.0;
            this.ctx.drawImage(this.shadowRender[j], 0, 0);

            let sharp = j ? true : false;
            
            for (let i in this.piano.keys) {
                if (!this.piano.keys.hasOwnProperty(i)) continue;

                let key = this.piano.keys[i];
                if (key.sharp !== sharp) continue;
                if (!key.loaded) {
                    this.ctx.globalAlpha = 0.2;
                } else if (key.timeLoaded > timeLoadedEnd) {
                    this.ctx.globalAlpha = ((now - key.timeloaded) / 1000) * 0.8 + 0.2;
                } else {
                    this.ctx.globalAlpha = 1.0;
                }

                let y = 0;
                if (key.timePlayed > timePlayedEnd) {
                    y = Math.floor(this.keyMovement - (((now - key.timePlayed) / 100) * this.keyMovement));
                }
                
                let x = Math.floor(key.sharp ? this.blackKeyOffset + this.whiteKeyWidth * key.spatial : this.whiteKeyWidth * key.spatial);
                let image = key.sharp ? this.blackKeyRender : this.whiteKeyRender;
                this.ctx.drawImage(image, x, y);

                let keyName = key.baseNote[0].toUpperCase();

                if (sharp) {
                    keyName += '#';
                }

                keyName += key.octave + 1;

                if (key.blips.length) {
                    let alpha = this.ctx.globalAlpha;
                    let w, h;

                    if (key.sharp) {
                        x += this.blackBlipX;
                        y = this.blackBlipY;
                        w = this.blackBlipWidth;
                        h = this.blackBlipHeight;
                    } else {
                        x += this.whiteBlipX;
                        y = this.whiteBlipY;
                        w = this.whiteBlipWidth;
                        h = this.whiteBlipHeight;
                    }

                    for (let b = 0; b < key.blips.length; b++) {
                        let blip = key.blips[b];

                        if (blip.time > timeBlipEnd) {
                            this.ctx.fillStyle = blip.color;
                            this.ctx.globalAlpha = alpha - ((now - blip.time) / 1000);
                            this.ctx.fillRect(x, y, w, h);
                        } else {
                            key.blips.splice(b, 1);
                            b--;
                        }

                        y -= Math.floor(h * 1.1);
                    }
                }
            }
        }

        this.ctx.restore();
    }

    renderNoteLyrics() {
        for (var part_id in this.noteLyrics) {
            if (!this.noteLyrics.hasOwnProperty(i))
                continue;
            var lyric = this.noteLyrics[part_id];
            var lyric_x = x;
            var lyric_y = this.whiteKeyHeight + 1;
            this.ctx.fillStyle = key.lyric.color;
            var alpha = this.ctx.globalAlpha;
            this.ctx.globalAlpha = alpha - ((now - key.lyric.time) / 1000);
            this.ctx.fillRect(x, y, 10, 10);
        }
    }

    getHit(x, y) {
        for (var j = 0; j < 2; j++) {
            var sharp = j ? false : true;
            for (var i in this.piano.keys) {
                if (!this.piano.keys.hasOwnProperty(i))
                    continue;
                var key = this.piano.keys[i];
                if (key.sharp != sharp)
                    continue;
                if (key.rect.contains(x, y)) {
                    var v = y / (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight);
                    v += 0.25;
                    v *= DEFAULT_VELOCITY;
                    if (v > 1.0)
                        v = 1.0;
                    return {
                        "key": key,
                        "v": v
                    };
                }
            }
        }
        return null;
    }

    isSupported() {
        return true;
    }

    static translateMouseEvent(evt) {
        var element = evt.target;
        var offx = 0;
        var offy = 0;
        do {
            if (!element)
                break;
            offx += element.offsetLeft;
            offy += element.offsetTop;
        } while (element = element.offsetParent);
        return {
            x: (evt.pageX - offx) * window.devicePixelRatio,
            y: (evt.pageY - offy) * window.devicePixelRatio
        }
    }
}

if (window.location.hostname === "localhost") {
    var soundDomain = 'http://localhost';
} else {
    var soundDomain = 'https://mppclone.com';
}

function SoundSelector(piano) {
    this.initialized = false;
    this.keys = piano.keys;
    this.loading = {};
    this.notification;
    this.packs = [];
    this.piano = piano;
    this.soundSelection = localStorage.soundSelection ? localStorage.soundSelection : "mppclassic";
    this.addPack({
        name: "MPP Classic",
        keys: Object.keys(this.piano.keys),
        ext: ".mp3",
        url: "/sounds/mppclassic/"
    });
}

SoundSelector.prototype.addPack = function(pack, load) {
    var self = this;
    self.loading[pack.url || pack] = true;
    function add(obj) {
        var added = false;
        for (var i = 0; self.packs.length > i; i++) {
            if (obj.name == self.packs[i].name) {
                added = true;
                break;
            }
        }
        if (added)
            return console.warn("Sounds already added!!");
        if (obj.url.substr(obj.url.length - 1) != "/")
            obj.url = obj.url + "/";
        var html = document.createElement("li");
        html.classList = "pack";
        html.innerText = obj.name + " (" + obj.keys.length + " keys)";
        html.onclick = function() {
            self.loadPack(obj.name);
            self.notification.close();
        }
        ;
        obj.html = html;
        self.packs.push(obj);
        self.packs.sort(function(a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        if (load)
            self.loadPack(obj.name);
        delete self.loading[obj.url];
    }
    if (typeof pack == "string") {
        $.getJSON(soundDomain + pack + "/info.json").done(function(json) {
            json.url = pack;
            add(json);
        });
    } else
        add(pack);
}

SoundSelector.prototype.addPacks = function(packs) {
    for (var i = 0; packs.length > i; i++)
        this.addPack(packs[i]);
}

SoundSelector.prototype.init = function() {
    var self = this;
    if (self.initialized)
        return console.warn("Sound selector already initialized!");
    if (!!Object.keys(self.loading).length)
        return setTimeout(function() {
            self.init();
        }, 250);
    $("#sound-btn").on("click", function() {
        if (document.getElementById("Notification-Sound-Selector") != null) {
            if (self.notification) self.notification.close();
        }
        var html = document.createElement("ul");
        for (var i = 0; self.packs.length > i; i++) {
            var pack = self.packs[i];
            if (pack.name == self.soundSelection)
                pack.html.classList = "pack enabled";
            else
                pack.html.classList = "pack";
            html.appendChild(pack.html);
        }
        self.notification = new Notification({
            title: "Sound Selector",
            html: html,
            id: "Sound-Selector",
            duration: -1,
            target: "#sound-btn"
        });
    });
    self.initialized = true;
    self.loadPack(self.soundSelection, true);
}

SoundSelector.prototype.loadPack = function(pack, f) {
    for (var i = 0; this.packs.length > i; i++) {
        var p = this.packs[i];
        if (p.name == pack) {
            pack = p;
            break;
        }
    }
    if (typeof pack == "string") {
        console.warn("Sound pack does not exist! Loading default pack...");
        return this.loadPack("MPP Classic");
    }
    if (pack.name == this.soundSelection && !f)
        return;
    if (pack.keys.length != Object.keys(this.piano.keys).length) {
        this.piano.keys = {};
        for (var i = 0; pack.keys.length > i; i++)
            this.piano.keys[pack.keys[i]] = this.keys[pack.keys[i]];
        this.piano.renderer.resize();
    }
    var self = this;
    for (var i in this.piano.keys) {
        if (!this.piano.keys.hasOwnProperty(i))
            continue;
        (function() {
            var key = self.piano.keys[i];
            key.loaded = false;
            self.piano.audio.load(key.note, soundDomain + pack.url + key.note + pack.ext, function() {
                key.loaded = true;
                key.timeLoaded = Date.now();
            });
        }
        )();
    }
    if (localStorage)
        localStorage.soundSelection = pack.name;
    this.soundSelection = pack.name;
}

SoundSelector.prototype.removePack = function(name) {
    var found = false;
    for (var i = 0; this.packs.length > i; i++) {
        var pack = this.packs[i];
        if (pack.name == name) {
            this.packs.splice(i, 1);
            if (pack.name == this.soundSelection)
                this.loadPack(this.packs[0].name);
            break;
        }
    }
    if (!found)
        console.warn("Sound pack not found!");
}

class PianoKey {
    constructor (note, octave) {
        this.note = note + octave;
        this.baseNote = note;
        this.octave = octave;
        this.sharp = note.indexOf("s") != -1;
        this.loaded = false;
        this.timeLoaded = 0;
        this.domElement = null;
        this.timePlayed = 0;
        this.blips = [];
    }
}

class Piano {
    constructor (rootElement) {
        let piano = this;
        piano.rootElement = rootElement;
        piano.keys = {};

        let white_spatial = 0;
        let black_spatial = 0;
        
        let black_it = 0;
        let black_lut = [2, 1, 2, 1, 1];

        let addKey = (note, octave) => {
            let key = new PianoKey(note, octave);
            piano.keys[key.note] = key;

            if (key.sharp) {
                key.spatial = black_spatial;
                black_spatial += black_lut[black_it % 5];
                black_it++;
            } else {
                key.spatial = white_spatial;
                white_spatial++;
            }
        }

        addKey("a", -1);
        addKey("as", -1);
        addKey("b", -1);

        let notes = "c cs d ds e f fs g gs a as b".split(" ");
        for (let oct = 0; oct < 7; oct++) {
            for (let i in notes) {
                addKey(notes[i], oct);
            }
        }
        addKey("c", 7);

        this.renderer = new CanvasRenderer().init(this);
        
        window.addEventListener('resize', () => {
            piano.renderer.resize();
        });

        window.AudioContext = window.AudioContext || window.webkitAudioContext || undefined;

        // let audio_engine = AudioEngineWeb;
        // this.audio = new audio_engine().init();
        this.audio = old_audio_context;
    }

    play(note, vol, participant, delay_ms, lyric) {
        if (!this.keys.hasOwnProperty(note) || !participant)
            return;
        var key = this.keys[note];
        // if (key.loaded)
        //     this.audio.play(key.note, vol, delay_ms, participant.id);
        var self = this;
        setTimeout(function() {
            self.renderer.visualize(key, participant.color);
            if (lyric) {}
            var jq_namediv = $(participant.nameDiv);
            jq_namediv.addClass("play");
            setTimeout(function() {
                jq_namediv.removeClass("play");
            }, 30);
        }, delay_ms || 0);
    }

    stop(note, participant, delay_ms) {
        if (!this.keys.hasOwnProperty(note))
            return;
        var key = this.keys[note];
        // if (key.loaded)
        //     this.audio.stop(key.note, delay_ms, participant.id);
    }
}

globalThis.gPiano = new Piano(document.getElementById("piano"));
MPP.piano = gPiano;

var Note = function(note, octave) {
    this.note = note;
    this.octave = octave || 0;
};



var n = function(a, b) { return {note: new Note(a, b), held: false}; };

var transpose_octave = 0;
var capsLockKey = false;

var velocityFromMouseY = function() {
    return 0.1 + (MPP.Bot.my / 100) * 0.6;
};

var gKeyboardSeq = 0;


gPiano.key_binding = {
    65: n("gs"),
    90: n("a"),
    83: n("as"),
    88: n("b"),
    67: n("c", 1),
    70: n("cs", 1),
    86: n("d", 1),
    71: n("ds", 1),
    66: n("e", 1),
    78: n("f", 1),
    74: n("fs", 1),
    77: n("g", 1),
    75: n("gs", 1),
    188: n("a", 1),
    76: n("as", 1),
    190: n("b", 1),
    191: n("c", 2),
    222: n("cs", 2),

    49: n("gs", 1),
    81: n("a", 1),
    50: n("as", 1),
    87: n("b", 1),
    69: n("c", 2),
    52: n("cs", 2),
    82: n("d", 2),
    53: n("ds", 2),
    84: n("e", 2),
    89: n("f", 2),
    55: n("fs", 2),
    85: n("g", 2),
    56: n("gs", 2),
    73: n("a", 2),
    57: n("as", 2),
    79: n("b", 2),
    80: n("c", 3),
    189: n("cs", 3),
    219: n("d", 3),
    187: n("ds", 3),
    221: n("e", 3)
};

globalThis.gSoundSelector = new SoundSelector(gPiano);

gSoundSelector.addPacks(["/sounds/Emotional/", "/sounds/Emotional_2.0/", "/sounds/GreatAndSoftPiano/", "/sounds/HardAndToughPiano/", "/sounds/HardPiano/", "/sounds/Harp/", "/sounds/Harpsicord/", "/sounds/LoudAndProudPiano/", "/sounds/MLG/", "/sounds/Music_Box/", "/sounds/NewPiano/", "/sounds/Orchestra/", "/sounds/Piano2/", "/sounds/PianoSounds/", "/sounds/Rhodes_MK1/", "/sounds/SoftPiano/", "/sounds/Steinway_Grand/", "/sounds/Untitled/", "/sounds/Vintage_Upright/", "/sounds/Vintage_Upright_Soft/"]);
gSoundSelector.init();

var gPianoMutes = (localStorage.pianoMutes ? localStorage.pianoMutes : "").split(',').filter(v=>v);
var enableSynth = false;

gClient.on("n", msg => {
    var t = msg.t - gClient.serverTimeOffset + TIMING_TARGET - Date.now();
    var participant = gClient.findParticipantById(msg.p);
    if (gPianoMutes.indexOf(participant._id) !== -1)
        return;
    for (var i = 0; i < msg.n.length; i++) {
        var note = msg.n[i];
        var ms = t + (note.d || 0);
        if (ms < 0) {
            ms = 0;
        } else if (ms > 10000)
            continue;
        if (note.s) {
            gPiano.stop(note.n, participant, ms);
        } else {
            var vel = (typeof note.v !== "undefined") ? parseFloat(note.v) : DEFAULT_VELOCITY;
            if (!vel)
                vel = 0;
            else if (vel < 0)
                vel = 0;
            else if (vel > 1)
                vel = 1;
            gPiano.play(note.n, vel, participant, ms);
            if (enableSynth) {
                gPiano.stop(note.n, participant, ms + 1000);
            }
        }
    }
});











// if the original server ever comes back, maybe some special stuff will come with it

gClient.on('data', msg => {
    console.log(msg);
});





// youtube parser
// when this is on, the whole page crashes constantly because google is a terrible company

// gClient.on('a', msg => {
//     parseYoutube(msg);
// });

// gClient.on('c', msg => {
//     for (let m of msg.c) {
//         parseYoutube(m);
//     }
// });

// let parseYoutube = (msg) => {
//     let match = msg.a.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);

//     if (match) {
//         let id = match[1];
//         let url = `https://www.youtube.com/embed/${id}?autoplay=1&origin=${window.location.origin}`;
//         let iframe = document.createElement("iframe");
//         iframe.src = url;
//         // iframe.style.border = "none";
//         // iframe.style.pointerEvents = "none";

//         let li = $(`<li class="youtube"></li>`);
//         $(li).css({
//             opacity: 1
//         });
//         $(li).append(iframe);
//         if (!$(li).data("player")) {
//             $(li).data("player", true);
//             $(`#chat ul li[title='${msg.p._id}']:contains('${msg.a}')`).after(li);
//         }
//     }
// }





















// replace volume slider with original one

$("#volume #volume-slider").css({
    background: "url(/volume2.png) no-repeat",
    "background-position": "50% 50%"
});































/**
 * EarthBound Battle Backgrounds (https://github.com/gjtorikian/Earthbound-Battle-Backgrounds-JS)
 */

// ROM graphics

class ROMGraphics {
    constructor(bitsPerPixel) {
        this.bitsPerPixel = bitsPerPixel
    }
    /* Internal function - builds the tile array from the graphics buffer. */
    buildTiles() {
        const n = this.gfxROMGraphics.length / (8 * this.bitsPerPixel)
        this.tiles = []
        for (let i = 0; i < n; ++i) {
            this.tiles.push(new Array(8))
            const o = i * 8 * this.bitsPerPixel
            for (let x = 0; x < 8; ++x) {
                this.tiles[i][x] = new Array(8)
                for (let y = 0; y < 8; ++y) {
                    let c = 0
                    for (let bp = 0; bp < this.bitsPerPixel; ++bp) {
                        // NOTE: Such a slight bug! We must Math.floor this value, due to the possibility of a number like 0.5 (which should equal 0).
                        const halfBp = Math.floor(bp / 2)
                        const gfx = this.gfxROMGraphics[o + y * 2 + (halfBp * 16 + (bp & 1))]
                        c += ((gfx & (1 << 7 - x)) >> 7 - x) << bp
                    }
                    this.tiles[i][x][y] = c
                }
            }
        }
    }
    /* JNI C code */
    draw(bmp, palette, arrayROMGraphics) {
        const data = bmp
        let block = 0
        let tile = 0
        let subPalette = 0
        let n = 0
        let b1 = 0
        let b2 = 0
        let verticalFlip = false
        let horizontalFlip = false
        /* TODO: Hardcoding is bad; how do I get the stride normally? */
        const stride = 1024
        /* For each pixel in the 256×256 grid, we need to render the image found in the dump */
        for (let i = 0; i < 32; ++i) {
            for (let j = 0; j < 32; ++j) {
                n = j * 32 + i
                b1 = arrayROMGraphics[n * 2]
                b2 = arrayROMGraphics[n * 2 + 1] << 8
                block = b1 + b2
                tile = block & 0x3FF
                verticalFlip = (block & 0x8000) !== 0
                horizontalFlip = (block & 0x4000) !== 0
                subPalette = (block >> 10) & 7
                this.drawTile(data, stride, i * 8, j * 8, palette, tile, subPalette, verticalFlip, horizontalFlip)
            }
        }
        return data
    }
    drawTile(pixels, stride, x, y, palette, tile, subPalette, verticalFlip, horizontalFlip) {
        const subPaletteArray = palette.getColors(subPalette)
        let i, j, px, py, pos, rgbArray
        for (i = 0; i < 8; ++i) {
            if (horizontalFlip) {
                px = x + 7 - i
            } else {
                px = x + i
            }
            for (j = 0; j < 8; ++j) {
                rgbArray = subPaletteArray[this.tiles[tile][i][j]]
                if (verticalFlip) {
                    py = y + 7 - j
                } else {
                    py = y + j
                }
                pos = 4 * px + stride * py
                pixels[pos + 0] = (rgbArray >> 16) & 0xFF
                pixels[pos + 1] = (rgbArray >> 8) & 0xFF
                pixels[pos + 2] = (rgbArray) & 0xFF
            }
        }
        return pixels
    }
    /**
     * Internal function - reads graphics from the specified block and builds
     * tileset.
     *
     * @param block
     * The block to read graphics data from
     */
    loadGraphics(block) {
        this.gfxROMGraphics = block.decompress()
        this.buildTiles()
    }
}


