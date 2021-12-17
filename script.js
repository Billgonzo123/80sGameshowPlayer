
let channelBuffer = 0;
let n = 0;
let on = 1; //if the screen is "on" used for fake shutoff
let lastInPlaylist = 0; //flag for when last episode
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

if (!localStorage.getItem('overscan')) { localStorage.setItem('overscan', 1); };
if (!localStorage.getItem('horizontalShift')) { localStorage.setItem('horizontalShift', 0); };
if (!localStorage.getItem('verticalShift')) { localStorage.setItem('verticalShift', 0); };
let vidWindow = document.querySelector('#player');
vidWindow.style.display = "none";
let overscanSize = parseFloat(localStorage.getItem('overscan'));
let horShift = parseFloat(localStorage.getItem('horizontalShift'));
let verShift = parseFloat(localStorage.getItem('verticalShift'));
vidWindow.style.transform = "scale(" + overscanSize + ")";
vidWindow.style.disply = "none";
///check if there is saved page Data
vol = parseInt(localStorage.getItem('channelNum10171999'));

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
let rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes));

//--------------------------------CHECK IF RANDOM CHANNEL HAS BEEN GENERATED-----------------------------------//

/*This checks if the random channel has been generated before, and if it has it finds a new number.
If there are no more random numbers to select, it clears the array of prev channels and starts over */

//load saved prev generated channels. But first check if one exists. If it dosn't, create an empty one
if (!localStorage.getItem(num)) { localStorage.setItem(num, JSON.stringify([0])); };

pageData = JSON.parse(localStorage.getItem(num));

if (pageData.length - 1 >= channel[num].episodes) { nextPlaylist(); }
//check each prev ch with the current generated ch
for (let i = 1; i < pageData.length; i++) {
    //if the ch has been generated before, make new number and start over (i=0)
    if (pageData[i] === rndEpisodeNum) {
        rndEpisodeNum = Math.floor((Math.random() * channel[num].episodes));
        //start for loop over
        i = 1;
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
        host: 'http://www.youtube-nocookie.com',
        playerVars: {
            start: beginPlace,
            controls: 0,
            modestbranding: 1,
            listType: 'playlist',
            list: channel[num].list[pageData[0]],
            index: epNum + 1, //this always subtracts one
            // loop: 1, //llops the playlist
            autoplay: true,
            mute: 0,

        },

        events: {

            'onReady': //when the video is ready

                function (event) {


                    vidWindow = document.querySelector('#player');
                    overscanSize = parseFloat(localStorage.getItem('overscan'));
                    vidWindow.style.transform = "scale(" + overscanSize + ")";
                    vidWindow.style.marginLeft = horShift + "px";
                    vidWindow.style.marginTop = verShift + "px";
                    event.target.playVideo();
                    vidWindow.style.display = "block";
                    //////////hide static and pause//////////////////
                    document.getElementById("staticImage").style.display = "none";
                    sound.pause();

                    console.log("RndNumber: ", rndEpisodeNum, "realEpNumber: ", epNum);
                    console.log("Ep running: ", player.getPlaylistIndex());
                    ///check if all videos played
                    if (pageData.length - 1 >= channel[num].episodes) {
                        nextPlaylist();
                    }
                    //if the video is unavailable or blocked index will return -1
                    if (player.getPlaylistIndex() < 0) {
                        //if video is an error, push the index number represented my rndEpisodeNum-1
                        //this only works with a newly random generated item
                        pageData.push(epNum);
                        ///and save the array to local storage (each channel gets its own local storage slot)
                        localStorage.setItem(num, JSON.stringify(pageData));
                        if (!(pageData.length > channel[num].episodes)) {
                            refresh();
                        } else {
                            channelEntry.style.whiteSpace = "pre";
                            channelEntry.textContent = "Reset Channel Memory!\nEnter 99 at Channel List";
                            channelEntry.style.display = "block";
                        }


                    }

                    //update vol every 100 ms
                    setInterval(function () {
                        //constat update of volume
                        event.target.setVolume(vol);

                    }, 100)



                    let k = setTimeout(function () {
                        epNum = player.getPlaylistIndex();
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
                        clearTimeout(k);

                    }, 1000);
                },


            'onStateChange': function (event) {
                console.log(channel[num].episodes);
                console.log("original Rnd Ch: ", rndEpisodeNum);
                console.log("Last Ep: ", player.getPlaylistIndex() - 1, epNum);
                console.log("New Ep: ", player.getPlaylistIndex());




                //checks if current episode is the last in the playlist and sets flag if true
                //  if (player.getPlaylistIndex() === channel[num].episodes){ lastInPlaylist = 1; console.log('This is the lastepisode in playlist');}
                if (player.getPlayerState() == 0) {
                    console.log("Playlist ended");
                    pageData.push(player.getPlaylistIndex());

                    ///and save the array to local storage (each channel gets its own local storage slot)
                    localStorage.setItem(num, JSON.stringify(pageData));
                    refresh();
                }
                ///epNum keeps track of episode updates
                if (epNum < player.getPlaylistIndex()) {

                    epNum = player.getPlaylistIndex();
                    //waits for 2secs before saving prev video to let player have time to switch states
                    let j = setTimeout(function () {
                        //add last episode to watched list array (pageData)
                        pageData.push(player.getPlaylistIndex() - 1);

                        ///and save the array to local storage (each channel gets its own local storage slot)
                        localStorage.setItem(num, JSON.stringify(pageData));

                        //checks if rndEpisodeNum is the last possible number and resets the array if it is
                        if (pageData.length - 1 >= channel[num].episodes) {
                            nextPlaylist()

                        }
                        clearTimeout(j);
                    }, 500);
                }
            }
        }
    });


}



///mases sure ch dip hides
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
    console.log(name);

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
            case '+':
            case 'PageUp':
                if (listDisplay.style.display == "block") { overscan(name); } else {
                    if (num >= channel.length - 1) { num = 0; refresh(); } else { num++; refresh(); }
                }
                break;
            case '-':
            case 'PageDown':
                if (listDisplay.style.display == "block") { overscan(name); } else {
                    if (num <= 0) { num = channel.length - 1; refresh(); } else { num--; refresh(); }
                }
                break;
            case '.':
            case ',':
            case 'Backspace':
                if (listDisplay.style.display === "none") { chDisp.style.display = "block"; listDisplay.style.display = 'block'; listDisplay2.style.display = 'block'; }
                else { chDisp.style.display = "none"; listDisplay.style.display = 'none'; listDisplay2.style.display = 'none'; }
                break;
            case '*':
                volumeUp(name);
                break;
            case '/':
                volumeDown(name);
                break;
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                if (listDisplay.style.display == "block") { overscan(name); }
                break;
            case "End":
                pageData.push(rndEpisodeNum);
                ///and save the array to local storage (each channel gets its own local storage slot)
                localStorage.setItem(num, JSON.stringify(pageData));
                refresh();
                break;
            case "Home":
                screenOff();
                break;




        }

    }
    ///----------enter numbers for channel input--------///
    else {
        //we must clear this value if a system message is displayed (like Memory Cleared or whatever)
        if (isNaN(channelEntry.textContent)) { channelEntry.textContent = '' };
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

//---------------------------------Fake Turn Off--------------------------------------//
function screenOff() {
    if (on) {
        on = 0;
        vol = 0;
        document.getElementById("soundSrc").src = "TVoff.ogg";
        sound.load();
        sound.play();

        //do screen off animation
        vidWindow.style.animation = "powerOff .5s"

        let offTimer = setInterval(function () {
            vidWindow.remove();
            clearInterval(offTimer);
        }, 450);
        //turn off
    }
    else {
        vol = 50;
        on = 1;
        //turn back on
        refresh();
    }
}
//---------------------------------OverscanSet-----------------------------------------------//
function overscan(key) {

    switch (key) {
        case "PageUp":
            overscanSize += .01;
            break;

        case "PageDown":
            overscanSize -= .01;
            break;
        case "ArrowLeft":
            horShift -= 1;
            break;
        case "ArrowRight":
            horShift += 1;
            break;
        case "ArrowUp":
            verShift -= 1;
            break;
        case "ArrowDown":
            verShift += 1;
            break;
    }
    localStorage.setItem('overscan', overscanSize);
    localStorage.setItem('horizontalShift', horShift);
    localStorage.setItem('verticalShift', verShift);
    vidWindow.style.transform = "scale(" + overscanSize + ")";
    vidWindow.style.marginLeft = horShift + "px";
    vidWindow.style.marginTop = verShift + "px";


}


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

//Turn out Youtube iFrame API can only qure 200 videos at a time. So i will have to limit playlists to 200 and find a workaround
function loadChannels() {
    const array = [{ name: 'Ch: 1 - Gameshows80', list: ['PLuKKJ5FR6_i-G3X2qR9kJ6TRri07AKsJe'], episodes: 194, randPoint: 0 },
    { name: 'Ch: 2 - Classic Gameshows', list: ['PLMK_6ky6NNPquQ8vAnN-qCIoHdW1lwpRq'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 3 - Price Is Right', list: ['PL8qCHhbAE4pOUkwTUoGISIfrFNO9uXFk5'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 4 - Jeopardy!', list: ['PLAzwm-_ugsYC6SsJMjKbzvE2nk0307yIn'], episodes: 200, randPoint: 0 },
    { name: "Ch: 5 - Who's Line", list: ['PLDyueIBpFFG6W_2txiVyc5VYindbBFjSn'], episodes: 200, randPoint: 0 },
    { name: "Ch: 6 - Cartoons Forever", list: ['PLo6LMGdjaTzI76fH66OWjpBJw0cleQGC6'], episodes: 200, randPoint: 0 },
    { name: "Ch: 7 - WB Cartoons", list: ['PLJYf0JdTApCofHRdo-RXjd2uHUl1551oI'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 8 - Toonami Swim', list: ['PLo6LMGdjaTzIQMz6eUB-Y74F87PRvvi_q'], episodes: 8, randPoint: 1 },
    { name: 'Ch: 9 - Saturday Morning', list: ['PLo6LMGdjaTzIaer3XW-Hw9zalxpnFBPS7'], episodes: 17, randPoint: 1 },
    { name: 'Ch: 10 - Kablam', list: ['PLUiXHUbyt3otcSGKiOCzZn4pFalAt3sFS'], episodes: 48, randPoint: 0 },
    { name: 'Ch: 11 - Recess', list: ['PL3panSrIeiNJZN_qyGZvhvtI4R-xKsEW8'], episodes: 135, randPoint: 0 },
    { name: 'Ch: 12 - Pepper Ann', list: ['PLLhOnau-tupR82ubLjcY2tQNlUMGTn__z'], episodes: 160, randPoint: 0 },
    { name: "Ch: 13 - 80's TV", list: ['PLGS5pi29Z6qFmRfb4q9RPURwKK0xMk6IT'], episodes: 200, randPoint: 0 },
    { name: "Ch: 14 - 90's TV", list: ['PLo6LMGdjaTzLxpgNhSiCjzwMPXRLJjwaJ'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 15 - Computer Chronicles', list: ['PLmM8tWTshxQBws_fIdi5qH63rZxrlB0qL'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 16 - TechTV', list: ['PLo6LMGdjaTzKuVaftTtnSPfMOOlFhORm8'], episodes: 1, randPoint: 1 }, //no longer works
    { name: 'Ch: 17 - Xplay', list: ['PLKE9oP_rYnRdLhG3HW__6ytTwvgSBM9pu'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 18 - Sitcoms Make Me Cring', list: ['PLGk6y7qjGXVt-tH7E0P2CEedDGJp-fT1p'], episodes: 463, randPoint: 0 },
    { name: 'Ch: 19 - MTV', list: ['PLId5xJ_xHV-k3ZgNju2ifMLct7-8uRKr8'], episodes: 200, randPoint: 0 },
    { name: 'Ch: 20 - MST 3000', list: ['PLDXsAHvr3XNPn8PfqYpU7NBHWOzdow89l'], episodes: 177, randPoint: 0 },
    { name: "Ch: 21 - 90's B-Movies", list: ['PLKxdKKLx3iRTyfWK8SQghHUGHfOTGhRl2'], episodes: 200, randPoint: 0 },
    { name: "Ch: 22 - 80's B-Movies", list: ['PLKxdKKLx3iRQbB2m8NkfX6e-PwMvNI-Wl'], episodes: 200, randPoint: 0 },
    { name: "Ch: 23 - Free Movies", list: ['PLHPTxTxtC0ibVZrT2_WKWUl2SAxsKuKwx'], episodes: 200, randPoint: 0 },
    { name: "Ch: 24 - Vintage Movies", list: ['PLyMSG-Q0Oh8cr6AG1jbptCGW5P6n-_Szz'], episodes: 129, randPoint: 0 },
    { name: 'Ch: 25 - Scifi Movies', list: ['PLo6LMGdjaTzJ8y8OBialU_RVhIXg8HpLe'], episodes: 73, randPoint: 0 },
    { name: "Ch: 26 - Horror/SciFi Movies", list: ['PL2e8s2GMT08wtackx9qxf_cJZsTxVy0yL'], episodes: 200, randPoint: 0 },
    { name: "Ch: 27 - Seaonal Flixs", list: ['PLo6LMGdjaTzJzG8GLIcleCBci8R8ZN54S'], episodes: 7, randPoint: 0 },
    { name: "Ch: 28 - MultiTest", list: ['PLo6LMGdjaTzJ4bLJqDG1SEheI4HKDfIqX', 'PLo6LMGdjaTzIQMz6eUB-Y74F87PRvvi_q'], episodes: 4, randPoint: 0 },




    ];
    return array;
}

function nextPlaylist() {
    let currList = pageData[0];
    if (currList >= channel[num].list.length - 1) {
        pageData = [0];
        localStorage.setItem(num, JSON.stringify(pageData));
        console.log("PLAYLIST END. RUNNING NEXT PLAYLIST FUNCTION");
        refresh();
    }
    else {
        currList++;
        pageData = [currList];
        localStorage.setItem(num, JSON.stringify(pageData));
        console.log("PLAYLIST END. RUNNING NEXT PLAYLIST FUNCTION");
        refresh();
    }



}