// State management
const state = {
    activeChannel: null,
    filteredData: null,
    isShowHD: false,
    isListExpanded: false,
    nowspan: "",
    starttime: "",
    stoptime: "",
    currtime: "",
    rtdtime: "",
    duration: "",
    channelID: "",
    currentPlayingProgram: "",
    currentPlayingPrograminfo: "",
    foundgenere: null,
    foundlanguage: null,
    timeoutId: null,
    count: 0,
    duration1: null,
    remaining1: null,
    showtimestart: null,
    showtimeend: null,
    channelname: "",
    info: ""
};

// Update state with validation
function updateState(newState) {
    Object.entries(newState).forEach(([key, value]) => {
        if (state.hasOwnProperty(key)) {
            state[key] = value;
        }
    });
}

var player = videojs("myVideo", {
  playbackRates: [0.5, 1, 1.5, 2],
  responsive: true,
  liveui: true,
  fill: true,
  enableSmoothSeeking: true,
  controls: true,
  controlBar: {
    skipButtons: {
      forward: 5,
      backward: 10,
    },
  },
});

player.hlsQualitySelector({
  displayCurrentQuality: true,
  default: "highest",
});
player.options({
  disablePictureInPicture: true,
  // audioOnlyMode: true
});

const channelList = document.getElementById("channel-list");
const scrollChannel = document.getElementById("scroll-channel");
//const epgList = document.getElementById("epg-list");
const channelName = document.getElementById("channel-name");
const channelLogo = document.getElementById("channel-logo");
const myVideo = document.getElementById("myVideo");
const filterLanguage = document.getElementById("language-filter");
const filterCategory = document.getElementById("channel-filter");
const channelInfo = document.getElementById("channel-info");
//const channelid = document.getElementById("channel-list");
const videodata = document.getElementById("video-container");
const videodetails = document.getElementById("video-details");
//const scrollableDiv = document.getElementById("your-scrollable-div");
const tagid = document.getElementsByClassName("nowplayingtag");
const scrollfab = document.querySelector(".fab");
const epgstyle = document.getElementById("epg-scroll");
const verticalline = document.getElementById("vertical-line");
const epgScroll = document.getElementById("channel-list-container");
const toggleButton = document.getElementById("toggle-list-size");
const timecontrol = document.querySelector(".vjs-time-control");
const showTime = document.getElementById("show-time");
const castInfo = document.getElementById("cast-info");
const ratings = document.getElementById("ratings");
const epgDays = document.getElementById("epg-days");

function detectBrowserAndDeviceType() {
  const userAgent = navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );

  if (
    userAgent.indexOf("Chrome") !== -1 ||
    userAgent.indexOf("Chromium") !== -1
  ) {
    return isMobile ? "Chrome Mobile" : "Chrome Desktop";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    return isMobile ? "Firefox Mobile" : "Firefox Desktop";
  } else if (userAgent.indexOf("Safari") !== -1) {
    return isMobile ? "Safari Mobile" : "Safari Desktop";
  } else {
    return isMobile ? "Unknown Mobile" : "Unknown Desktop";
  }
}

function notifyUserForCorsExtension() {
  const browser = detectBrowserAndDeviceType();
  let extensionUrl;

  switch (browser) {
    case "Chrome Mobile":
      alert(
        "We're sorry, but CORS extensions are not currently supported on Chrome mobile. You can try accessing this content on a desktop browser or consider using Firefox Mobile, which offers CORS extension support."
      );

      return;
    case "Firefox Mobile":
    case "Firefox Desktop":
      extensionUrl =
        "https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin/";
      break;
    case "Chrome":
    case "Chrome Desktop":
      extensionUrl =
        "https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en";
      break;
    case "Safari Mobile":
    case "Safari Desktop":
      extensionUrl = "";
      break;
    default:
      alert("Unsupported browser");
      return;
  }

  const hasSeenMessage = sessionStorage.getItem("corsExtensionMessageShown");
  if (!hasSeenMessage) {
    const message = `You need to install a CORS extension to access this content. You can find extensions for your browser here:`;
    alert(`${message} \n ${extensionUrl}`);
    sessionStorage.setItem("corsExtensionMessageShown", "true");
  }
}

// Debounce function to prevent scroll event from firing too often
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll event listener
window.addEventListener("scroll", debounce(function() {
    if (window.scrollY > 120) {
        scrollfab.style.display = "block";
    } else {
        scrollfab.style.display = "none";
    }
    if (window.scrollY > 450 || window.scrollX > 150) {
        //  myVideo.style.display = "none";
        //  myVideo.style.behavior = "smooth";
        if (!document.pictureInPictureElement && !player.paused()) {
          player.requestPictureInPicture();
        }
        if (document.pictureInPictureElement) {
          // myVideo.style.display = "none";
          // myVideo.style.behavior = "smooth";
        } else {
          // myVideo.style.display = "flex";
          // myVideo.style.behavior = "smooth";
        }
    } else {
        //  myVideo.style.display = "flex";
        // myVideo.style.behavior = "smooth";
        if (document.pictureInPictureElement && !player.paused()) {
          player.exitPictureInPicture();
        }
    }
}, 150));

const scrollToTopButton = document.getElementById("scroll-to-top");
scrollToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
filterCategory.addEventListener("keydown", preventArrowKeyChange);
filterLanguage.addEventListener("keydown", preventArrowKeyChange);
function preventArrowKeyChange(event) {
  if (
    event.keyCode === 38 ||
    event.keyCode === 40 ||
    event.keyCode === 37 ||
    event.keyCode === 39
  ) {
    // Up and down arrow keys
    console.log(event.keyCode);
    event.preventDefault();
  }
}

function generateEPGList() {
  apichannels().then((data) => {
    if (data) {
      data.forEach((item) => {
        const epgListItem = getEPGDataByApi(item.id);
        if (epgListItem) {
          nowtimewidth();
        }
      });
    }
  });
}
function nowtimewidth() {
  if (!state.isListExpanded) {
    const id111 = jioepgtimeformat();
    const nowtime = convertTimeToHHMM(id111.toString());
    const id222 = generateTimeList(id111.toString());
    const remainingsecs = getRemainingTime(id222[0], nowtime);
    verticalline.style.left = 370 + remainingsecs * 11 + "px";
    return remainingsecs;
  }
}
function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
async function apichannels() {
  // console.log(foundlanguage);
  // console.log(foundgenere);
  return fetch(
    `https://jiotvapi.cdn.jio.com/apis/v3.0/getMobileChannelList/get/?langId=6&devicetype=phone&os=android&usertype=JIO&version=343`
  )
    .then((response) => response.json())
    .then((data) => {
      if (state.foundgenere == null && state.foundlanguage == null) {
        const Array2 = data.result.map((channels) => ({
          id: channels.channel_id,
          name: channels.channel_name,
          logo: `https://jiotv.catchup.cdn.jio.com/dare_images/images/${channels.logoUrl}`,
        }));
        return Array2;
      } else if (state.foundgenere != null && state.foundlanguage == null) {
        const Array2 = data.result
          .filter(
            (channels) =>
              channels.channelCategoryId.toString() === state.foundgenere.toString()
          )
          .map((channels) => ({
            id: channels.channel_id,
            name: channels.channel_name,
            logo: `https://jiotv.catchup.cdn.jio.com/dare_images/images/${channels.logoUrl}`,
          }));
        return Array2;
      } else if (state.foundgenere == null && state.foundlanguage != null) {
        const Array2 = data.result
          .filter(
            (channels) =>
              channels.channelLanguageId.toString() === state.foundlanguage.toString()
          )
          .map((channels) => ({
            id: channels.channel_id,
            name: channels.channel_name,
            logo: `https://jiotv.catchup.cdn.jio.com/dare_images/images/${channels.logoUrl}`,
          }));
        return Array2;
      } else {
        const Array2 = data.result
          .filter(
            (channels) =>
              channels.channelCategoryId.toString() ===
                state.foundgenere.toString() &&
              channels.channelLanguageId.toString() === state.foundlanguage.toString()
          )
          .map((channels) => ({
            id: channels.channel_id,
            name: channels.channel_name,
            logo: `https://jiotv.catchup.cdn.jio.com/dare_images/images/${channels.logoUrl}`,
          }));
        return Array2;
      }
    });
}
function checkAndCallFunction() {
  const now = new Date();
  const minutes = now.getMinutes();
  nowtimewidth();
  // filtereditemlist()
  if (minutes === 30 || minutes === 0) {
    // filtereditemlist();
    if (state.activeChannel != null) {
      /* getduration(activeChannel).then((data) => {
    if (data) {
     /* player.duration = function () {
        return duration1 * 60; // the amount of seconds of video
      };*/
      /*  var timeDividerSpan = player.controlBar
        .getChild("timeDivider")
        .el()
        .querySelector("span");
      timeDividerSpan.textContent =
        showtimestart.toString() + "/" + showtimeend.toString();*/
      /* player.on('loadedmetadata', function() {
                  var duration1 = player.duration;
                  console.log(duration1);
                });
    }
  });*/
    }
  }
}
checkAndCallFunction();
// Check every minute
//checkAndCallFunction();
setInterval(checkAndCallFunction, 60000);

function filtereditemlist() {
  channelList.innerHTML = "";
  scrollChannel.innerHTML = "";
  apichannels().then((data) => {
    if (data) {
      if (data.length === 0) {
        //  console.log(data.length);
        channelList.innerHTML = `<div class="container">
        <h2 class="error-title">Sorry no channel found</h2>
            <img src=${"https://github.com/Abinanthankv/tv.m3u/blob/main/undraw_monitor_iqpq.svg?raw=true"}>    
    </div>`;
      }

      data.forEach((item) => {
        // console.log(item.id);
        const listItem = document.createElement("li");
        listItem.id = "channelIDD";
        const scrollchannelid = document.createElement("li");
        scrollchannelid.id = "scrollchannelID";
        scrollchannelid.insertAdjacentHTML(
          "beforeend",
          `<img src="${item.logo}">`
        );
        const nowPlayingSpan = document.createElement("span");
        nowPlayingSpan.id = "nowplaying-span"; // Add a class for styling
        nowPlayingSpan.innerText = item.name;
        scrollchannelid.appendChild(nowPlayingSpan);
        const ulepg = document.createElement("ul");
        ulepg.id = item.id;
        listItem.appendChild(ulepg);
        ulepg.classList.add("myClass");

        const tagid = document.getElementsByClassName("nowplayingtag");

        scrollchannelid.addEventListener("click", (event) => {
          const currentPlaying = document.getElementById("current-playing");
          const currentPlayinginfo = document.getElementById(
            "current-playing-info"
          );
          currentPlaying.innerHTML = "";
          currentPlayinginfo.innerHTML = "";
          const apiUrl = `https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get?offset=0&channel_id=${item.id}&langId=6`;
          var currentTime = convertTimeToHHMMSS(jioepgtimeformat());
          var channelLogo = document.getElementById("channel-logo");
          channelLogo.style.display = "block";
          channelLogo.src = item.logo;
          makeApiRequest(apiUrl).then((data) => {
            if (data) {
              data.epg.forEach((item) => {
                if (
                  item.showtime <= currentTime &&
                  currentTime < item.endtime
                ) {
                  fetch(
                    `https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`
                  ).then((response) => {
                    const imageUrl = response.url;
                    if (imageUrl != "") {
                      channelLogo.src = imageUrl;
                    }
                  });
                  fetch(
                    `https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`
                  ).then((response) => {
                    const posterUrl = response.url;
                    if (posterUrl != "") {
                      player.poster(posterUrl);
                    }
                  });
                  console.log(item.episode_num);
                  console.log(item.episode_desc);
                  currentPlaying.style.color = "green";
                  currentPlaying.innerHTML = item.showname;
                  if (item.episode_num === -1 || item.episode_desc === "") {
                    currentPlayinginfo.innerHTML = item.description;
                  } else {
                    currentPlayinginfo.innerHTML =
                      "📺" +
                      item.episode_num.toString() +
                      ":" +
                      item.episode_desc;
                    // castInfo.innerHTML='🎭'+item.starCast;
                  }
                 // console.log(foundlanguage)
                 // console.log(foundgenere)
                  if(state.foundlanguage==6)
                  {
                   // console.log("language")
                    if(state.foundgenere==5||state.foundgenere==6)
                    {
                      
                      getMovieInfo(item.showname)
                      .then((data) => {
                        if (data!=" ") {
                          ratings.innerHTML="";
                          channelLogo.src = data.poster;
                         // console.log(data);
                          console.log(data.rottenTomatoesScore)
                          const imdbIcon = document.createElement("i");
                          imdbIcon.classList.add("fa-brands", "fa-imdb");
                          const ratingText = document.createTextNode(
                            ` ${data.imdbRating}`
                          ); // Add a space before the rating
                        
                          const imdbLink = document.createElement('a');
                          imdbLink.href = `https://www.imdb.com/title/${data.imdbID}/`;
                          imdbLink.textContent=` ${data.imdbRating}`
                          imdbLink.target = '_blank'; 
                          ratings.appendChild(imdbIcon);
                        //  ratings.appendChild(ratingText);
                          ratings.appendChild(imdbLink);
                          if(data.rottenTomatoesScore!=" ")
                          {
                            const rottenTomatoesIcon = document.createElement("img");
                            rottenTomatoesIcon.src=`https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rotten_Tomatoes_alternative_logo.svg/216px-Rotten_Tomatoes_alternative_logo.svg.png?20180315205910`// Replace with your Rotten Tomatoes icon class
                            const rottenTomatoesText = document.createTextNode(
                             `${data.rottenTomatoesScore}`
                            );
                            ratings.appendChild(rottenTomatoesIcon);
                            ratings.appendChild(rottenTomatoesText);
                          }
                          if(data.metaCritic!=" ")
                          {
                            const metacriticIcon = document.createElement("img");
                            metacriticIcon.src=`https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Metacritic.svg/132px-Metacritic.svg.png?20150314054830`
                            // Replace with your Metacritic icon class
                            const metacriticText = document.createTextNode(
                              `${data.metaCritic}`
                            );
                            ratings.appendChild(metacriticIcon);
                            ratings.appendChild(metacriticText);

                          }
                          
                         
                          // Do something with the data, e.g., display it on a webpage
                        }
                      })
                      .catch((error) => console.error(error));
                    }

                  }
                 
                }
              });
            }
          });
          videodata.style.display = "block";
          notifyUserForCorsExtension();
          const channelInfo = document.getElementById("channel-info");
          state.channelID = item.id;
          channelInfo.style.display = "flex";
          for (const channelItem of scrollChannel.children) {
            channelItem.style.backgroundColor = "";
          }
          // to change css style
          scrollchannelid.style.backgroundColor = "lightgreen";

          state.activeChannel = item.id;
          player.pause();
          if (item.id != "") {
            player.src({
              src: `https://allinonereborn.com/tata-tv40.php?id=12148`,

              type: "application/vnd.apple.mpegURL",
            });
            player.ready(function () {
              player.load();
              player.play();
            });
            getduration(item.id).then((data) => {
              if (data) {
                var timeDividerSpan = player.controlBar
                  .getChild("timeDivider")
                  .el()
                  .querySelector("span");
                timeDividerSpan.textContent =
                  state.showtimestart.toString() + "/" + state.showtimeend.toString();
                showTime.innerHTML =
                  "⌛" +
                  state.showtimestart.toString() +
                  " / " +
                  state.showtimeend.toString();
                console.log(state.showtimestart.slice(0, 5), state.showtimeend.slice(0, 5));
                /* player.on('loadedmetadata', function() {
                  var duration1 = player.duration;
                  console.log(duration1);*/
                /*player.duration = function () {
                  return remaining1 * 60; // the amount of seconds of video
                };*/
              }
            });
          } else {
            player.src({
              src: item.url,
              type: "application/vnd.apple.mpegURL",
            });
            player.load();
            player.play();
          }
        });
        channelList.appendChild(listItem);
        scrollChannel.appendChild(scrollchannelid);
      });
    }
  });
}

// Optimized DOM manipulation
function updateChannelInfo(channel) {
    const channelInfo = document.getElementById("channel-info");
    if (!channelInfo) return;
    
    const fragment = document.createDocumentFragment();
    
    // Create elements and append to fragment
    const channelName = document.createElement("h2");
    channelName.textContent = channel.name;
    fragment.appendChild(channelName);
    
    const channelLogo = document.createElement("img");
    channelLogo.src = channel.logo;
    fragment.appendChild(channelLogo);
    
    channelInfo.innerHTML = '';
    channelInfo.appendChild(fragment);
}

// Optimized day list creation
function createDayList() {
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    const today = new Date();
    const dayIndex = today.getDay();

    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 7; i++) {
        const dayName = daysOfWeek[(dayIndex + i) % 7];
        const listItem = document.createElement("li");
        listItem.textContent = dayName === daysOfWeek[dayIndex] ? "Today" : dayName;
        listItem.value = i;
        
        listItem.addEventListener("click", () => {
            state.count = listItem.value;
            filtereditemlist();
            generateEPGList();
        });
        
        fragment.appendChild(listItem);
    }

    return fragment;
}

const categories = {
  "Business News": "💼",
  Entertainment: "🍿",
  Infotainment: "📺",
  Kids: "👶",
  Lifestyle: "🏠",
  Movies: "🎥",
  Music: "🎵",
  News: "📰",
  Shopping: "🛒",
  Sports: "⚽",
};
const languages = {
  1: "Hindi",
  2: "Marathi",
  3: "Punjabi",
  4: "Urdu",
  5: "Bengali",
  6: "English",
  7: "Malayalam",
  8: "Tamil",
  9: "Gujarati",
  10: "Odia",
  11: "Telugu",
  12: "Bhojpuri",
  13: "Kannada",
  14: "Assamese",
  15: "Nepali",
  16: "French",
};
for (const langugage in languages) {
  const option = document.createElement("option");
  option.value = languages[langugage];
  option.text = languages[langugage];
  filterLanguage.appendChild(option);
}
for (const category in categories) {
  const option = document.createElement("option");
  const emoji = categories[category];
  option.value = category;
  option.text = `${emoji} ${category}`;
  filterCategory.appendChild(option);
}

filterCategory.parentElement.appendChild(filterLanguage);

filterCategory.addEventListener("change", () => {
  const genre_dict = {
    5: "Entertainment",
    6: "Movies",
    7: "Kids",
    8: "Sports",
    9: "Lifestyle",
    10: "Infotainment",
    11: "Religious",
    12: "News",
    13: "Music",
    14: "Regional",
    15: "Devotional",
    16: "Business News",
    17: "Educational",
    18: "Shopping",
    19: "Jio Darshan",
  };
  const selectedCategory = filterCategory.value;
  state.foundgenere = getKeyByValue(genre_dict, selectedCategory);
  toggleButton.style.display = "block";
  resetview();
  filtereditemlist();
});

filterLanguage.addEventListener("change", () => {
  const language_dict = {
    1: "Hindi",
    2: "Marathi",
    3: "Punjabi",
    4: "Urdu",
    5: "Bengali",
    6: "English",
    7: "Malayalam",
    8: "Tamil",
    9: "Gujarati",
    10: "Odia",
    11: "Telugu",
    12: "Bhojpuri",
    13: "Kannada",
    14: "Assamese",
    15: "Nepali",
    16: "French",
  };
  const selectedGroup = filterLanguage.value;
  const selectedCategory = filterCategory.value;

  state.foundlanguage = getKeyByValue(language_dict, selectedGroup);
  toggleButton.style.display = "block";
  resetview();
  filtereditemlist(state.filteredData);
  // generateEPGList(filteredData);
});

toggleButton.addEventListener("click", function () {
  const selectedGroup = filterLanguage.value;
  const selectedCategory = filterCategory.value;
  // Filter data based on selected group (language) and category
  if (selectedGroup === null && selectedCategory === null) {
    alert("Please select any language to continue");
  }
  if (state.isListExpanded) {
    filtereditemlist();
    scrollChannel.classList.remove("channel-toggle");
    scrollChannel.classList.add("scroll-list");
    scrollChannel.style.position = "sticky";
    verticalline.style.display = "flex";
    verticalline.style.background = "#7cd179";
    epgScroll.style.display = "flex";
    epgScroll.style.width = 1300 + "%";
    epgDays.style.display = "flex";
    generateEPGList();
    epgstyle.style.display = "flex";
    videodetails.style.position = "relative";
  } else {
    scrollChannel.style.position = "relative";
    videodetails.style.position = "sticky";
    filtereditemlist();
    verticalline.style.display = "none";
    epgstyle.style.display = "none";
    scrollChannel.classList.add("channel-toggle");
    scrollChannel.classList.remove("scroll-list");
    epgScroll.style.display = "block";
    epgScroll.style.width = 100 + "%";
    epgDays.style.display = "none";
  }

  if (state.isListExpanded) {
    toggleButton.textContent = "HIDE EPG";
  } else {
    toggleButton.textContent = "SHOW EPG";
  }

  state.isListExpanded = !state.isListExpanded; // Toggle state for next click
});

function resetview() {
  verticalline.style.display = "none";
  epgstyle.style.display = "none";
  scrollChannel.classList.add("channel-toggle");
  scrollChannel.classList.remove("scroll-list");
  epgScroll.style.display = "block";
  epgScroll.style.width = 100 + "%";
  scrollChannel.style.position = "relative";
  videodetails.style.position = "sticky";
  scrollChannel.style.zIndex = 0;
  state.isListExpanded = "false";
  toggleButton.textContent = "SHOW EPG";
  epgDays.style.display = "none";
}

function updateRemainingTime(channelID) {
  const id1 = channelID;
  console.log("yes", id1);
}

function getRemainingTime(starttime, stoptime) {
  // Split the time strings into hours and minutes
  const currentHour = parseInt(starttime.split(":")[0]);
  const currentMinute = parseInt(starttime.split(":")[1]);
  const stopHour = parseInt(stoptime.split(":")[0]);
  const stopMinute = parseInt(stoptime.split(":")[1]);
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const stopTotalMinutes = stopHour * 60 + stopMinute;
  let difference = stopTotalMinutes - currentTotalMinutes;
  if (difference < 0) {
    difference += 24 * 60; // Add a day if the stop time is before current time
  }
  // Convert the difference back to hours and minutes
  //const remainingHours = Math.floor(difference / 60);
  //const remainingMinutes = difference % 60;
  // Format the remaining time as hh:mm string
  // Calculate remaining hours, minutes, and seconds
  // const remainingHours = Math.floor(difference / 3600);
  //const remainingMinutes = Math.floor((difference % 3600) / 60);
  //const remainingSeconds = difference % 60;
  // return `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  //return `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  return difference;
}

function getEPGDataByApi(channelId) {
  const apiUrl = `https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get?offset=${state.count}&channel_id=${channelId}&langId=6`; // Replace with your API URL
  const epgul = document.getElementById(channelId);

  var currentTime = convertTimeToHHMMSS(jioepgtimeformat());
  const curr = document.createElement("li");
  curr.id = "timeshift";

  makeApiRequest(apiUrl).then((data) => {
    if (data) {
      data.epg.forEach((item) => {
        if (state.count != 0) {
          const prev = document.createElement("li");
          prev.id = "timeshift";

          var epgtime = document.getElementById("epg-time");
          epgtime.innerHTML = "";
          epgtime.style.display = "flex";
          const timeList = generateTimeList(getTodaysMidnight().toString());
          timeList.forEach((item, index) => {
            const timeline = document.createElement("li");
            timeline.id = "timeline";
            timeline.innerHTML = item;
            epgtime.appendChild(timeline);
          });
          if (item.showtime <= currentTime) {
            prev.textContent = item.showname;
            prev.style.width = item.duration * 12 + "px";

            epgul.appendChild(prev);
            prev.addEventListener("click", () => {
              const existingWrapper = document.querySelector(".wrapper");
              if (existingWrapper) {
                existingWrapper.remove();
              }

              const wrapper = document.createElement("div");
              wrapper.classList.add("wrapper");
              // Create content for the wrapper based on the clicked item
              const img = document.createElement("img");
              const h2 = document.createElement("h2");
              const span = document.createElement("span");
              span.textContent =
                "⌛" +
                item.showtime.slice(0, 5).toString() +
                " / " +
                item.endtime.slice(0, 5).toString();
              h2.textContent = ` ${item.showname}`;
              const p = document.createElement("p");
              if (item.episode_num === -1 || item.episode_desc === "") {
                state.info = item.description;
              } else {
                state.info =
                  "📺" + item.episode_num.toString() + ":" + item.episode_desc;
                // castInfo.innerHTML='🎭'+item.starCast;
              }
              p.textContent = ` ${state.info}`;
              img.src = `https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`;

              wrapper.appendChild(img);
              wrapper.appendChild(h2);
              wrapper.appendChild(p);
              wrapper.appendChild(span);
              // Create close button
              const addclaendarButton = document.createElement("button");
              addclaendarButton.classList.add("addclanedar-button");
              const closeButton = document.createElement("button");
              closeButton.classList.add("close-button");
              closeButton.textContent = "X";
              closeButton.addEventListener("click", () => {
                wrapper.remove();
              });
              addclaendarButton.textContent = "Add to Calendar";
              addclaendarButton.addEventListener("click", () => {
                addToCalendar(
                  item.startEpoch,
                  item.endEpoch,
                  item.showname + " " + "@" + " " + item.channel_name,
                  state.info
                );
              });
              wrapper.appendChild(addclaendarButton);
              wrapper.appendChild(closeButton);

              document.body.appendChild(wrapper);
              wrapper.style.display = "flex";
            });
          } else {
            const future = document.createElement("li");
            const epgTime = document.createElement("li");

            epgTime.id = "epgtime";
            future.id = "timeshift";
            const button = document.createElement("button");
            button.id = "addtocalendar";
            button.textContent = "📅" + "Add to Calendar";
            future.innerHTML = "";
            future.textContent = item.showname;
            // future.insertAdjacentHTML( "beforeend", `<img src=${`https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`}>`);
            future.style.width = item.duration * 12 + "px";
            future.addEventListener("click", () => {
              const existingWrapper = document.querySelector(".wrapper");
              if (existingWrapper) {
                existingWrapper.remove();
              }

              const wrapper = document.createElement("div");
              wrapper.classList.add("wrapper");
              // Create content for the wrapper based on the clicked item
              const img = document.createElement("img");
              const h2 = document.createElement("h2");
              const span = document.createElement("span");
              span.textContent =
                "⌛" +
                item.showtime.slice(0, 5).toString() +
                " / " +
                item.endtime.slice(0, 5).toString();
              h2.textContent = ` ${item.showname}`;
              const p = document.createElement("p");
              if (item.episode_num === -1 || item.episode_desc === "") {
                state.info = item.description;
              } else {
                state.info =
                  "📺" + item.episode_num.toString() + ":" + item.episode_desc;
                // castInfo.innerHTML='🎭'+item.starCast;
              }
              p.textContent = ` ${state.info}`;
              img.src = `https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`;

              wrapper.appendChild(img);
              wrapper.appendChild(h2);
              wrapper.appendChild(p);
              wrapper.appendChild(span);
              // Create close button
              const addclaendarButton = document.createElement("button");
              addclaendarButton.classList.add("addclanedar-button");
              const closeButton = document.createElement("button");
              closeButton.classList.add("close-button");
              closeButton.textContent = "X";
              closeButton.addEventListener("click", () => {
                wrapper.remove();
              });
              addclaendarButton.textContent = "Add to Calendar";
              addclaendarButton.addEventListener("click", () => {
                addToCalendar(
                  item.startEpoch,
                  item.endEpoch,
                  item.showname + " " + "@" + " " + item.channel_name,
                  state.info
                );
              });
              wrapper.appendChild(addclaendarButton);
              wrapper.appendChild(closeButton);

              document.body.appendChild(wrapper);
              wrapper.style.display = "flex";
            });

            epgul.appendChild(future);
          }

          // curr.insertAdjacentHTML( "beforeend", `<img src=${`https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodeThumbnail}`}>`);
        } else {
          var epgtime = document.getElementById("epg-time");
          epgtime.innerHTML = "";
          epgtime.style.display = "flex";
          const timeList = generateTimeList(jioepgtimeformat().toString());
          timeList.forEach((item, index) => {
            const timeline = document.createElement("li");
            timeline.id = "timeline";
            timeline.innerHTML = item;
            epgtime.appendChild(timeline);
          });
          if (item.showtime <= currentTime && currentTime < item.endtime) {
            curr.textContent = item.showname;

            // curr.insertAdjacentHTML( "beforeend", `<img src=${`https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodeThumbnail}`}>`);
            var duration = getRemainingTime(currentTime, item.endtime);
            if (duration * 12 < 362) {
              curr.style.width = 352 + "px";
              //curr.style.paddingRight = duration * 10.4 + "px";
            } else {
              curr.style.width = duration * 12 + "px";
            }
            epgul.appendChild(curr);
          }
          if (item.showtime > currentTime) {
            const future = document.createElement("li");
            const epgTime = document.createElement("li");
            const nowTime = document.createElement("li");
            epgTime.id = "epgtime";
            future.id = "timeshift";

            future.innerHTML = "";
            future.textContent = item.showname;
            // future.insertAdjacentHTML("beforeend", `<img src=${`https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`}>` );
            future.style.width = item.duration * 12 + "px";
            future.addEventListener("click", () => {
              const existingWrapper = document.querySelector(".wrapper");
              if (existingWrapper) {
                existingWrapper.remove();
              }

              const wrapper = document.createElement("div");
              wrapper.classList.add("wrapper");
              // Create content for the wrapper based on the clicked item
              const img = document.createElement("img");
              const h2 = document.createElement("h2");
              const span = document.createElement("span");
              span.textContent =
                "⌛" +
                item.showtime.slice(0, 5).toString() +
                " / " +
                item.endtime.slice(0, 5).toString();
              h2.textContent = ` ${item.showname}`;
              const p = document.createElement("p");
              if (item.episode_num === -1 || item.episode_desc === "") {
                state.info = item.description;
              } else {
                state.info =
                  "📺" + item.episode_num.toString() + ":" + item.episode_desc;
                // castInfo.innerHTML='🎭'+item.starCast;
              }
              p.textContent = ` ${state.info}`;
              img.src = `https://jiotv.catchup.cdn.jio.com/dare_images/shows/${item.episodePoster}`;

              wrapper.appendChild(img);
              wrapper.appendChild(h2);
              wrapper.appendChild(p);
              wrapper.appendChild(span);
              // Create close button
              const addclaendarButton = document.createElement("button");
              addclaendarButton.classList.add("addclanedar-button");
              const closeButton = document.createElement("button");
              closeButton.classList.add("close-button");
              closeButton.textContent = "X";
              closeButton.addEventListener("click", () => {
                wrapper.remove();
              });
              addclaendarButton.textContent = "Add to Calendar";
              addclaendarButton.addEventListener("click", () => {
                addToCalendar(
                  item.startEpoch,
                  item.endEpoch,
                  item.showname + " " + "@" + " " + item.channel_name,
                  state.info
                );
              });
              wrapper.appendChild(addclaendarButton);
              wrapper.appendChild(closeButton);

              document.body.appendChild(wrapper);
              wrapper.style.display = "flex";
            });

            epgul.appendChild(future);
          }
        }
      });
    }
  });
  return state.count;
}
function getduration(channelId) {
  const apiUrl = `https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get?offset=${state.count}&channel_id=${channelId}&langId=6`; // Replace with your API URL
  var currentTime = convertTimeToHHMMSS(jioepgtimeformat());

  return makeApiRequest(apiUrl).then((data) => {
    if (data) {
      data.epg.forEach((item) => {
        if (item.showtime <= currentTime && currentTime < item.endtime) {
          //duration = getRemainingTime(currentTime, item.endtime);
          state.duration1 = item.duration;
          state.remaining1 = getRemainingTime(currentTime, item.endtime);
          state.showtimestart = item.showtime.slice(0, 5);
          state.showtimeend = item.endtime.slice(0, 5);
        }
      });
      return state.duration1; // Return the duration found
    }
    return null; // Return null if no data
  });
}

function convertTimeToHHMM(timeString) {
  // Extract year, month, day, hour, minute from the string
  const year = timeString.slice(0, 4);
  const month = timeString.slice(4, 6) - 1; // Months are 0-indexed
  const day = timeString.slice(6, 8);
  const hour = timeString.slice(8, 10);
  const minute = timeString.slice(10, 12);
  //const second = timeString.slice(12, 14);
  return `${hour}:${minute}`;
}
function convertTimeToHHMMSS(timeString) {
  // Extract year, month, day, hour, minute from the string
  const year = timeString.slice(0, 4);
  const month = timeString.slice(4, 6) - 1; // Months are 0-indexed
  const day = timeString.slice(6, 8);
  const hour = timeString.slice(8, 10);
  const minute = timeString.slice(10, 12);
  const second = timeString.slice(12, 14);
  return `${hour}:${minute}:${second}`;
}
function jioepgtimeformat() {
  var now = new Date();
  var year = now.getFullYear().toString().padStart(4, "0");
  var month = (now.getMonth() + 1).toString().padStart(2, "0"); // Month (0-indexed)
  var day = now.getDate().toString().padStart(2, "0");
  var currentTime = now.getTime() / 1000;
  // Apply the time shift in seconds
  var adjustedTime = currentTime;
  // Convert adjusted time back to a Date object
  var adjustedDate = new Date(adjustedTime * 1000);
  // Extract and format time components from adjusted Date object
  var hour = adjustedDate.getHours().toString().padStart(2, "0");
  var minute = adjustedDate.getMinutes().toString().padStart(2, "0");
  var second = adjustedDate.getSeconds().toString().padStart(2, "0");
  var formattedTime = year + month + day + hour + minute + second;
  return formattedTime;
}
function getTodaysMidnight() {
  var now = new Date();
  var year = now.getFullYear().toString().padStart(4, "0");
  var month = (now.getMonth() + 1).toString().padStart(2, "0"); // Month (0-indexed)
  var day = now.getDate().toString().padStart(2, "0");
  // Set hours, minutes, and seconds to 00:00
  now.setHours(0, 0, 0);
  var currentTime = now.getTime() / 1000;
  // Apply the time shift in seconds (if needed)
  var adjustedTime = currentTime;
  // Convert adjusted time back to a Date object
  var adjustedDate = new Date(adjustedTime * 1000);
  // Extract and format time components from adjusted Date object
  var hour = adjustedDate.getHours().toString().padStart(2, "0");
  var minute = adjustedDate.getMinutes().toString().padStart(2, "0");
  var second = adjustedDate.getSeconds().toString().padStart(2, "0");
  var formattedTime = year + month + day + hour + minute + second;
  return formattedTime;
}

function generateTimeList(timestamp) {
  const startDate = new Date(
    timestamp.substring(0, 4),
    timestamp.substring(4, 6) - 1,
    timestamp.substring(6, 8),
    timestamp.substring(8, 10),
    timestamp.substring(10, 12)
  );
  // Round down minutes to nearest 30
  startDate.setMinutes(Math.floor(startDate.getMinutes() / 30) * 30);
  // Create an array to store the time list
  const timeList = [];
  // Loop through 48 times (covering 24 hours in 30-minute intervals)
  for (let i = 0; i < 48; i++) {
    // Create a new Date object for each time slot
    const time = new Date(startDate);
    time.setMinutes(time.getMinutes() + i * 30);
    // Format the time as YYYYMMDDHHMM
    //  const formattedTime = `${time.getFullYear()}${('0' + (time.getMonth() + 1)).slice(-2)}${('0' + time.getDate()).slice(-2)}${('0' + time.getHours()).slice(-2)}${('0' + time.getMinutes()).slice(-2)}`;
    const formattedTime = `${time.getHours().toString().padStart(2, "0")}:${time
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    timeList.push(formattedTime);
  }
  return timeList;
}
function calculateItemWidth(startTime, stopTime, totalWidth, totalDuration) {
  // Convert timestamps to Date objects
  const startDate = new Date(
    startTime.substring(0, 4),
    startTime.substring(4, 6) - 1,
    startTime.substring(6, 8),
    startTime.substring(8, 10),
    startTime.substring(10, 12)
  );
  const stopDate = new Date(
    stopTime.substring(0, 4),
    stopTime.substring(4, 6) - 1,
    stopTime.substring(6, 8),
    stopTime.substring(8, 10),
    stopTime.substring(10, 12)
  );
  // Calculate duration in milliseconds
  const durationMillis = stopDate - startDate;
  // Calculate item width
  const itemWidth = (totalWidth / totalDuration) * durationMillis;
  return itemWidth;
}

// Cache for API responses
const apiCache = new Map();

async function makeApiRequest(url) {
    if (apiCache.has(url)) {
        return apiCache.get(url);
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        apiCache.set(url, data);
        return data;
    } catch (error) {
        console.error("Error making API request:", error);
        return null;
    }
}

function addToCalendar(startTime, endTime, title, info) {
  const startDate = new Date(startTime);
  const isoStartTime =
    startDate.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  // Convert endTime to ISO format
  const endDate = new Date(endTime);
  const isoEndTime =
    endDate.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  // Construct the calendar link
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${isoStartTime}/${isoEndTime}&details=${encodeURIComponent(info)}`;
  window.open(calendarLink, "_blank");
}

function createDayList() {
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    const today = new Date();
    const dayIndex = today.getDay();

    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 7; i++) {
        const dayName = daysOfWeek[(dayIndex + i) % 7];
        const listItem = document.createElement("li");
        listItem.textContent = dayName === daysOfWeek[dayIndex] ? "Today" : dayName;
        listItem.value = i;
        
        listItem.addEventListener("click", () => {
            state.count = listItem.value;
            filtereditemlist();
            generateEPGList();
        });
        
        fragment.appendChild(listItem);
    }

    return fragment;
}

const dayListContainer = document.getElementById("epg-days"); // Replace with your container ID
const listItems = createDayList();
dayListContainer.append(...listItems);

const listItemscolor = document.querySelectorAll("#epg-days li");

listItemscolor.forEach((item) => {
  item.addEventListener("click", function () {
    // Remove the 'active' class from all list items
    listItemscolor.forEach((listItem) => listItem.classList.remove("active"));

    // Add the 'active' class to the clicked item
    this.classList.add("active");
  });
});

const apiKey = "738593f2"; // Replace with your actual API key

async function getMovieInfo(title) {
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${title}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      const imdbRating = data.imdbRating;
      const imdbID=data.imdbID;
      console.log(data);
      var rottenTomatoesScore = ""; // Placeholder for Rotten Tomatoes
      var metaCritic = "";
      var poster = data.Poster;
      if (data.Ratings && data.Ratings.length > 0) {
        // Find the rating object with Source equal to 'Rotten Tomatoes'
        const rottenTomatoesRating = data.Ratings.find(
          (rating) => rating.Source === "Rotten Tomatoes"
        );
        const metaCriticRating = data.Ratings.find(
          (rating) => rating.Source === "Metacritic"
        );
       

        // If found, extract the value
        if (rottenTomatoesRating) {
          rottenTomatoesScore = rottenTomatoesRating.Value;
        }
        if (metaCriticRating) {
          metaCritic = metaCriticRating.Value;
        }
      }
      
      console.log(`IMDb Rating: ${imdbRating}`);
      console.log(`Rotten Tomatoes Score: ${rottenTomatoesScore}`);
      console.log(`Meta critic Score: ${metaCritic}`);
      return { imdbRating, rottenTomatoesScore, metaCritic, poster,imdbID };
    } else {
      console.error("Error fetching movie data:", data.Error);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Example usage:
