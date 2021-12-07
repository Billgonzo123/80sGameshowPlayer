
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
vol = localStorage.getItem('channelNum10171999');

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


//--------------------------------GENERATE RANDOM CHANNEL TO PLAY----------------------------------------------//

///find random episode
let rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes) + 1);

//--------------------------------CHECK IF RANDOM CHANNEL HAS BEEN GENERATED-----------------------------------//

/*This checks if the random channel has been generated before, and if it has it finds a new number.
If there are no more random numbers to select, it clears the array of prev channels and starts over */

//load saved prev generated channels. But first check if one exists. If it dosn't, create an empty one
if (!localStorage.getItem(num)) { localStorage.setItem(num, JSON.stringify([num])); };

pageData = JSON.parse(localStorage.getItem(num));

//check each prev ch with the current generated ch
for (let i = 1; i < pageData.length; i++) {
    //if the ch has been generated before, make new number and start over (i=0)
    if (pageData[i] === rndEpisodeNum) {
        rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes) + 1);
        //start for loop over
        i = 0;
    }
}

//-------------Old code that waited 10min. Now I check when episode ends and playlist index changes. Then save prev ep-------------////
///use timeout to wait and store the randum number until user has viewed the episode for a period of time
// let rndTimer = setTimeout(function () {
//     pageData.push(rndEpisodeNum);
//     ///and save the array to local storage (each channel gets its own local storage slot)
//     localStorage.setItem(num, JSON.stringify(pageData));

//     //checks if rndEpisodeNum is the last possible number and resets the array if it is
//     if (pageData.length > channel[num].episodes) {
//         pageData = [num];
//         localStorage.setItem(num, JSON.stringify(pageData));
//     }
//     clearTimeout(rndTimer);
// }, 600000)
///once new ch is found, push it into the array

//---------------------------------------------------END RANDOM NUM CHECK-------------------------------------------------//

//display ch name on screen
chDisp.textContent = channel[num].name;

//---init video stream---//
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads./////////////////////
function onYouTubeIframeAPIReady() {
    let epNum = rndEpisodeNum;
    var player = new YT.Player("player", {
        height: '480',
        width: '720',
        playerVars: {
            start: beginPlace,
            controls: 0,
            modestbranding: 1,
            listType: 'playlist',
            list: channel[num].list,
            index: epNum,
            autoplay: true,
            mute: 0,
        },

        events: {
            'onReady': //when the video is ready

                function (event) {
                    console.log("Ep is should run: ", rndEpisodeNum);
                    console.log("Ep running: ", player.getPlaylistIndex());
                    //if the video is unavailable or blocked index will return -1
                    if (player.getPlaylistIndex() < 0) {
                        //if video is an error, push the index number represented my rndEpisodeNum-1
                        //this only works with a newly random generated item
                        pageData.push(rndEpisodeNum - 1);
                        ///and save the array to local storage (each channel gets its own local storage slot)
                        localStorage.setItem(num, JSON.stringify(pageData));
                        refresh();
                    }

                    //update vol every 100 ms
                    setInterval(function () {
                        //constat update of volume
                        event.target.setVolume(vol);

                    }, 100)



                    setTimeout(function () {

                        // event.target.setShuffle({ 'shufflePlaylist': true });

                        /*This calculates the video length and finds how many times the value is divisible by 10 mins (600s)*/
                        //legnth is seconds
                        let vidLength = Math.floor((player.getDuration()));
                        //HOW MANY 15 MIN SLOTS EXISTS
                        let multi = Math.floor((vidLength / 600));
                        //A RANDOM NUM FOR A 15 MION SLOT 
                        let rnd = Math.floor(Math.random() * (multi));
                        /*Then we check if the selected channel wants to be set to a random point with randPoint = true
                        and finds a random spot in the video in increments of 10mins (600s)*/
                        if (channel[num].randPoint) { beginPlace = rnd * 600; }
                        /*Then we apply that value to the vidoe player via "seekTo()".
                         beginPlace default value is 0  so if randPoint isnt set it just starts at the beginning of the video*/
                        player.seekTo(beginPlace, true);


                    }, 1000);
                },

            'onStateChange': function (event) {


                ///if status is -1 (unstarted), this indicates we have moved to a new video in the playlist
                if (player.getPlayerState() === -1) {
                    console.log("original Rnd Ch: ", rndEpisodeNum - 1);
                    console.log("Last Ep: ", player.getPlaylistIndex() - 1);
                    console.log("New Ep: ", player.getPlaylistIndex());

                    //waits for 2secs before saving prev video to let player have time to switch states
                    let j = setTimeout(function () {
                        //add last episode to watched list array (pageData)
                        pageData.push(player.getPlaylistIndex() - 1);
                        ///and save the array to local storage (each channel gets its own local storage slot)
                        localStorage.setItem(num, JSON.stringify(pageData));

                        //checks if rndEpisodeNum is the last possible number and resets the array if it is
                        if (pageData.length > channel[num].episodes) {
                            pageData = [num];
                            localStorage.setItem(num, JSON.stringify(pageData));
                        }
                        clearTimeout(j);
                    }, 2000);
                }
            }
        }
    });


}




//////////hide static and pause//////////////////
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

//----------------------------Check for button inputs START-----------------------------//
let element = document.addEventListener('keydown', function (event) {
    var name = event.key;
    var code = event.code;


    /*
    +   = Ch+
    -   = Ch-
    *   = Vol+
    /   = Vol-
    .   = Channel List
    0-9 = Enter Channel
    F5  = Refresh Page (default browser key)
    */

    ///---Check if input is number or command key----///
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
    ///----------enter numbers for channel input--------///
    else {
        //we must clear this value if a system message is displayed
        if (isNaN(channelEntry.textContent)) {channelEntry.textContent=''};
        channelEntry.style.display = 'block';
        chDisp.style.display = "none";
        channelEntry.textContent += name;
        name = '';
        n++;


        //if two numbers have been input
        if (n >= 2) {
            
            let nn = channelEntry.textContent;
            //subtract one to specify array index
            nn--;



            if (nn >= channel.length || nn < 0) {

                  //if the chList is open, some number inputs can be used as special commands
                if (listDisplay.style.display == "block") {
                  //nn is decremented before hand so the input will be one less (ie, 99=98 or 00=-1)
                    switch (nn) {
                        case 98: 
                            localStorage.removeItem(num);
                            channelEntry.textContent = 'Channel Memory Cleared';
                            n = 0;
                            break;
                        case 97:
                            localStorage.clear();
                            channelEntry.textContent = 'All Memory Cleared';
                            n = 0;
                            break;
                        default:
                            channelEntry.style.display = 'none';
                            channelEntry.textContent = '';
                            n = 0;
                            break;
                    }
                }
                else {
                    channelEntry.style.display = 'none';
                    channelEntry.textContent = '';
                    n = 0;
                }
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
//----------------------------Check for button inputs END-----------------------------//

//----------------------------Volume Functions START-----------------------------//
function volumeUp() {
    clearTimeout(volTimeOut);
    volEl.style.display = 'block';
    (vol >= 100) ? vol = 100 : vol += 5;
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


    localStorage.setItem('channelNum10171999', vol);
    hideVol();
    return;
}

function volumeDown() {
    clearTimeout(volTimeOut);
    volEl.style.display = 'block';
    (vol <= 0) ? vol = 0 : vol -= 5;
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
//----------------------------Volume Functions END-----------------------------//

//----------------------------Initiate Functions-----------------------------//
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
    { name: "Ch: 6 - Cartoons Forever", list: 'PLo6LMGdjaTzIUwf2I-q_R1tG6Rig-DlIf', episodes: 1231, randPoint: 0 },
    { name: "Ch: 7 - WB Cartoons", list: 'PLJYf0JdTApCofHRdo-RXjd2uHUl1551oI', episodes: 431, randPoint: 0 },
    { name: 'Ch: 8 - Toonami Swim', list: 'PLo6LMGdjaTzIQMz6eUB-Y74F87PRvvi_q', episodes: 8, randPoint: 1 },
    { name: 'Ch: 9 - Saturday Morning Experience', list: 'PLo6LMGdjaTzIaer3XW-Hw9zalxpnFBPS7', episodes: 11, randPoint: 1 },
    { name: 'Ch: 10 - Kablam', list: 'PLUiXHUbyt3otcSGKiOCzZn4pFalAt3sFS', episodes: 48, randPoint: 0 },
    { name: 'Ch: 11 - Recess', list: 'PL3panSrIeiNJZN_qyGZvhvtI4R-xKsEW8', episodes: 135, randPoint: 0 },
    { name: 'Ch: 12 - Pepper Ann', list: 'PLLhOnau-tupR82ubLjcY2tQNlUMGTn__z', episodes: 160, randPoint: 0 },
    { name: 'Ch: 13 - Loony Tunes', list: 'PLZs0gQed9tMStrGoR2C58YOgQ-HclszH9', episodes: 155, randPoint: 0 },
    { name: "Ch: 14 - 80's TV", list: 'PLGS5pi29Z6qFmRfb4q9RPURwKK0xMk6IT', episodes: 507, randPoint: 0 },
    { name: "Ch: 15 - 90's TV", list: 'PLo6LMGdjaTzLxpgNhSiCjzwMPXRLJjwaJ', episodes: 285, randPoint: 0 },
    { name: 'Ch: 16 - Computer Chronicles', list: 'PLmM8tWTshxQBws_fIdi5qH63rZxrlB0qL', episodes: 647, randPoint: 0 },
    { name: 'Ch: 17 - TechTV', list: 'PLo6LMGdjaTzKuVaftTtnSPfMOOlFhORm8', episodes: 1, randPoint: 1 }, //no longer works
    { name: 'Ch: 18 - Xplay', list: 'PLKE9oP_rYnRdLhG3HW__6ytTwvgSBM9pu', episodes: 647, randPoint: 0 },
    { name: 'Ch: 19 - Sitcoms Make Me Cring', list: 'PLGk6y7qjGXVt-tH7E0P2CEedDGJp-fT1p', episodes: 463, randPoint: 0 },
    { name: 'Ch: 20 - MTV', list: 'PLId5xJ_xHV-k3ZgNju2ifMLct7-8uRKr8', episodes: 589, randPoint: 0 },
    { name: 'Ch: 21 - MST 3000', list: 'PLDXsAHvr3XNPn8PfqYpU7NBHWOzdow89l', episodes: 177, randPoint: 0 },
    { name: 'Ch: 22 - Movies', list: 'PLKxdKKLx3iRTyfWK8SQghHUGHfOTGhRl2', episodes: 914, randPoint: 0 },

    ];
    return array;
}
