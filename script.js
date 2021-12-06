
let channelBuffer = 0;
let n = 0;

let volEl = document.getElementById('volume');
volEl.style.display = 'none';
let vol = 50;
let volTimeOut = 0;
const sndSrc = document.getElementById('soundSrc');
const sound = document.getElementById('audioPlayer');
const channelEntry = document.getElementById('chEntry');
channelEntry.style.display = 'none';
const listDisplay = document.getElementById('chList');
const listDisplay2 = document.getElementById('chList2');
listDisplay.style.display = 'none';
listDisplay2.style.display = 'none';
const chDisp = document.getElementById('channelNameDisplay');
chDisp.style.display = "block";

///this will hold all of the channels to avoid repeatson refresh
let pageData = []
///clast ch saved here
if (!localStorage.getItem('channelNum10171615')) { localStorage.setItem('channelNum10171615', 0); };
///volume and other data saved here
if (!localStorage.getItem('channelNum10171999')) { localStorage.setItem('channelNum10171999', vol); };
///check if there is saved page Data
if (!localStorage.getItem('channelNum999888777')) { localStorage.setItem('channelNum999888777', JSON.stringify(pageData)); };
vol = localStorage.getItem('channelNum10171999');
pageData = JSON.parse(localStorage.getItem('channelNum999888777'));
///need to do this for a glitch. have to run down first or up will be glitched
volumeDown();
volumeUp();

sound.volume = (vol / 100);

channelEntry.textContent = "";
//create array of channels
//randPoint specifies if a video collection has long multi episode videos. mod is how many 15min sections in those videos (hrs*4)
let channel = loadChannels();
//////////////put channe;s into list////////
for (i = 0; i < 15; i++) {
    let li = document.createElement('li');
    li.textContent = channel[i].name;
    listDisplay.append(li);
}
for (i = 15; i < channel.length; i++) {
    let li = document.createElement('li');
    li.textContent = channel[i].name;
    listDisplay2.append(li);
}
///////////////////////////////

let beginPlace = 0;
//channel number saved here. Get it
let num = localStorage.getItem('channelNum10171615');
////////////////////////////////////////////////////////////////////////////////////

///find random episode
let rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes) + 1);

//--------------------------------CHECK IF RANDOM CH HAS BEEN GENERATED BEFORE FOR THIS SESSION-----------------------------------

//if channel was changed on refresh, clear channels form pageData. 
//if not check if the rndEpisodeNum has been generated before
if (pageData[0] != num) {
    pageData = [num];
    localStorage.setItem('channelNum999888777', JSON.stringify(pageData));
}
else {
    for (let i = 1; i < pageData.length; i++) {
        if (pageData[i] === rndEpisodeNum) {
            rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes) + 1);
            //start for loop over
            i = 0;
        }
        

    }
  
    pageData.push(rndEpisodeNum);
    localStorage.setItem('channelNum999888777', JSON.stringify(pageData));
}

if (pageData.length > channel[num].episodes)
{
    pageData = [num];
    localStorage.setItem('channelNum999888777', JSON.stringify(pageData));
}
/////////////////////////////////////////////////////////////////////////////

//display ch name on screen
chDisp.textContent = channel[num].name;


// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
console.log(channel[num].name);
console.log(rndEpisodeNum);
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads./////////////////////
function onYouTubeIframeAPIReady() {
    var numPl = rndEpisodeNum;
    var player = new YT.Player("player", {
        height: '480',
        width: '720',
        playerVars: {
            start: beginPlace,
            controls: 0,
            modestbranding: 1,
            listType: 'playlist',
            list: channel[num].list,
            index: numPl,
            autoplay: true,
            mute: 0,
        },

        events: {
            'onReady': function (event) {
                //update vol every 100 ms
                setInterval(function () {
                    event.target.setVolume(vol);

                }, 100)

                setTimeout(function () {

                    event.target.setShuffle({ 'shufflePlaylist': true });

                    //legnth is seconds
                    let vidLength = Math.floor((player.getDuration()));
                    //HOW MANY 15 MIN SLOTS EXISTS
                    let multi = Math.floor((vidLength / 600));
                    //A RANDOM NUM FOR A 15 MION SLOT 
                    let rnd = Math.floor(Math.random() * (multi));

                    if (channel[num].randPoint) { beginPlace = rnd * 600; }
                    player.seekTo(beginPlace, true);


                }, 1000);
            }
        }
    });


}


//////////hide static//////////////////
let timer = setInterval(
    function () {
        document.getElementById("staticImage").style.display = "none";
        sound.pause();

        clearInterval(timer);
    }
    , 3000);

let timer2 = setInterval(
    function () {


        chDisp.style.display = "none";
        clearInterval(timer2);
    }
    , 8000);

/////////Check for channel change///////
let element = document.addEventListener('keydown', function (event) {
    var name = event.key;
    var code = event.code;
    console.log(name);
    //g: Ch-
    //t: ch+
    //f5: default refresh, no need to map
    ///Number Input////

    ///make this a switch
    if (isNaN(name)) {
        switch (name) {
            case '+': if (num >= channel.length - 1) { num = 0; refresh(); } else { num++; refresh(); };
                break;
            case '-': if (num <= 0) { num = channel.length - 1; refresh(); } else { num--; refresh(); }
                break;
            case '.': if (listDisplay.style.display === "none") { chDisp.style.display = "block"; listDisplay.style.display = 'block'; listDisplay2.style.display = 'block'; }
            else { chDisp.style.display = "none"; listDisplay.style.display = 'none'; listDisplay2.style.display = 'none'; }
                break;
            case '*': volumeUp();
                break;
            case '/': volumeDown();
                break;
        }

    }
    ///enter numbers for channel input
    else {
        channelEntry.style.display = 'block';
        chDisp.style.display = "none";
        channelEntry.textContent += name;
        name = '';
        n++;
        console.log("Press number: ", n);


        if (n >= 2) {
            let nn = channelEntry.textContent;
            //subtract one to specify array index
            nn--;

            console.log(nn);

            if (nn >= channel.length) {
                channelEntry.style.display = 'none';
                channelEntry.textContent = '';
                n = 0;
            }
            else {
                setInterval(function () {
                    localStorage.setItem('channelNum10171615', nn);
                    location.reload();
                }, 500)
            }
        }

    }



});

////MAIN ENDS HERE////

function volumeUp() {
    clearTimeout(volTimeOut);
    volEl.style.display = 'block';
    if (vol >= 100) { vol = 100; } else { vol += 5; }
    volEl.textContent = "Volume [";
    for (i = 0; i < (vol); i += 5) {
        switch (i) {
            case 45: volEl.textContent += "|";
                break;
            default: volEl.textContent += "-";
                break;
        }
    }
    volEl.textContent += "]";

    sndSrc.volume = (vol / 100);
    console.log("static: ", sndSrc.volume);

    localStorage.setItem('channelNum10171999', vol);
    hideVol();
    return;
}

function volumeDown() {
    clearTimeout(volTimeOut);
    volEl.style.display = 'block';
    if (vol <= 0) { vol = 0; } else { vol -= 5; }
    volEl.textContent = "Volume [";
    for (i = 0; i < (vol); i += 5) {
        switch (i) {
            case 45: volEl.textContent += "|";
                break;
            default: volEl.textContent += "-";
                break;
        }
    }
    volEl.textContent += "]";

    sndSrc.volume = (vol / 100);
    console.log("static: ", sndSrc.volume);

    localStorage.setItem('channelNum10171999', vol);
    hideVol();
    return;
}



function hideVol() {
    volTimeOut = setTimeout(function () {
        volEl.style.display = 'none';
        return;
    }, 1500);
}


//////simply refreshes the page sfter saving the current channel////////////////
function refresh() {
    localStorage.setItem('channelNum10171615', num);
    location.reload();
}

function loadChannels() {
    const array = [{ name: 'Ch: 1 - Gameshows80', list: 'PLuKKJ5FR6_i-G3X2qR9kJ6TRri07AKsJe', episodes: 194, randPoint: 0 },
    { name: 'Ch: 2 - Classic Gameshows', list: 'PLMK_6ky6NNPquQ8vAnN-qCIoHdW1lwpRq', episodes: 405, randPoint: 0 },
    { name: 'Ch: 3 - Price Is Right', list: 'PL8qCHhbAE4pOUkwTUoGISIfrFNO9uXFk5', episodes: 581, randPoint: 0 },
    { name: 'Ch: 4 - Jeopardy!', list: 'PLAzwm-_ugsYC6SsJMjKbzvE2nk0307yIn', episodes: 444, randPoint: 0 },
    { name: "Ch: 5 - Who's Line", list: 'PLDyueIBpFFG6W_2txiVyc5VYindbBFjSn', episodes: 873, randPoint: 0 },
    { name: "Ch: 6 - 80's Cartoons", list: 'PLhNec9tcvCfBir8KQxopOdDGxTMsXtj3Z', episodes: 604, randPoint: 0 },
    { name: "Ch: 7 - 90's Cartoons", list: 'PLdWFJnovRkDvbewO8MJKNET2kvPQz00jA', episodes: 102, randPoint: 0 },
    { name: 'Ch: 8 - Toonami Swim', list: 'PLo6LMGdjaTzIQMz6eUB-Y74F87PRvvi_q', episodes: 8, randPoint: 1 },
    { name: 'Ch: 9 - Saturday Morning', list: 'PLo6LMGdjaTzIaer3XW-Hw9zalxpnFBPS7', episodes: 10, randPoint: 1 },
    { name: 'Ch: 10 - Kablam', list: 'PLUiXHUbyt3otcSGKiOCzZn4pFalAt3sFS', episodes: 48, randPoint: 0 },
    { name: 'Ch: 11 - Recess', list: 'PL3panSrIeiNJZN_qyGZvhvtI4R-xKsEW8', episodes: 135, randPoint: 0 },
    { name: 'Ch: 12 - Pepper Ann', list: 'PLLhOnau-tupR82ubLjcY2tQNlUMGTn__z', episodes: 160, randPoint: 0 },
    { name: 'Ch: 13 - Loony Tunes', list: 'PLZs0gQed9tMStrGoR2C58YOgQ-HclszH9', episodes: 155, randPoint: 0 },
    { name: "Ch: 14 - 80's TV", list: 'PLGS5pi29Z6qFmRfb4q9RPURwKK0xMk6IT', episodes: 507, randPoint: 0 },
    { name: "Ch: 15 - 90's TV", list: 'PLo6LMGdjaTzLxpgNhSiCjzwMPXRLJjwaJ', episodes: 285, randPoint: 0 },
    { name: 'Ch: 16 - Computer Chronicles', list: 'PLmM8tWTshxQBws_fIdi5qH63rZxrlB0qL', episodes: 647, randPoint: 0 },
    { name: 'Ch: 17 - TechTV', list: 'PLo6LMGdjaTzKuVaftTtnSPfMOOlFhORm8', episodes: 1, randPoint: 1 },
    { name: 'Ch: 18 - Xplay', list: 'PLKE9oP_rYnRdLhG3HW__6ytTwvgSBM9pu', episodes: 647, randPoint: 0 },
    { name: 'Ch: 19 - Sitcoms Make Me Cring', list: 'PLGk6y7qjGXVt-tH7E0P2CEedDGJp-fT1p', episodes: 463, randPoint: 0 },
    { name: 'Ch: 20 - MTV', list: 'PLId5xJ_xHV-k3ZgNju2ifMLct7-8uRKr8', episodes: 589, randPoint: 0 },
    { name: 'Ch: 21 - MST 3000', list: 'PLDXsAHvr3XNPn8PfqYpU7NBHWOzdow89l', episodes: 177, randPoint: 0 },
    { name: 'Ch: 22 - Movies', list: 'PLKxdKKLx3iRTyfWK8SQghHUGHfOTGhRl2', episodes: 914, randPoint: 0 },

    ];
    return array;
}