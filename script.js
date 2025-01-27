const playPauseBtn = document.querySelector(".play-pause-btn");
const theaterBtn = document.querySelector(".theater-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const captionsBtn = document.querySelector(".captions-btn");
const speedBtn = document.querySelector(".speed-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const video = document.querySelector("video");
const track = document.querySelector("track");
const title = document.querySelectorAll(".title");
const prevVideo = document.querySelector(".prev-video");
const switchVideo = document.querySelector(".switch-video");
const filesInput = document.querySelector("input[type=file]");
const filesButton = document.querySelector("a");
const playlist = document.querySelector("ul");

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
      togglePlay();
      break;
    case ",":
      changePrevVideo();
      break;
    case ".":
      changeVideo();
      break;
    case "k":
      togglePlay();
      break;
    case "f":
      toggleFullScreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
    case "c":
      toggleCaptions();
      break;
  }
});

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  );
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`;
  // previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();
    // thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

// Captions
const captions = video.textTracks[0];
captions.mode = "hidden";

captionsBtn.addEventListener("click", toggleCaptions);

function toggleCaptions() {
  const isHidden = captions.mode === "hidden";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

// Volume
muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", toggleFullScreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});

// Switch Video
// let count = JSON.parse(localStorage.getItem("Count")) || 0;

// const videos = ["01.Jun.24", "02.Jun.24", "08.Jun.24", "09.Jun.24", "15.Jun.24",
//                 "16.Jun.24", "22.Jun.24", "23.Jun.24", "29.Jun.24", "30.Jun.24",
//                 "06.Jul.24", "07.Jul.24", "13.Jul.24", "14.Jul.24", "20.Jul.24",
//                 "21.Jul.24", "01.Aug.24", "02.Aug.24", "08.Aug.24", "09.Aug.24",
//                 "15.Aug.24", "16.Aug.24", "22.Aug.24", "23.Aug.24", "29.Aug.24",
//                 "30.Aug.24", "03.Oct.24", "04.Oct.24",];

// const videosCount = videos.length - 1;

// const setSrc = (val) => `assets/LaughterChefs-${videos[val]}.mp4`;
// const setInnerHTML = (val) => `${val + 1} - LaughterChefs-${videos[val]}`;

// video.src = setSrc(count);
// track.src = setSrc(count);
// title.forEach((text) => text.innerHTML = setInnerHTML(count));

// prevVideo.addEventListener("click", changePrevVideo);
// switchVideo.addEventListener("click", changeVideo);

// function changePrevVideo(){
//  if (count < 1) return;
//  else count--

//  localStorage.setItem("Count", count)
//  video.src = setSrc(count);
//  track.src = setSrc(count);
//  title.forEach((text) => text.innerHTML = setInnerHTML(count));
// }

// function changeVideo(){
//  if (count === videosCount) return;
//  else count++

//  localStorage.setItem("Count", count)
//  video.src = setSrc(count);
//  track.src = setSrc(count);
//  title.forEach((text) => text.innerHTML = setInnerHTML(count));
// }

// redirect filesButton click to hidden filesInput
filesButton.addEventListener("click", (e) => {
  filesInput.click();
  e.preventDefault();
  return false;
});

filesInput.addEventListener(
  "change",
  function (e) {
    // delete all current list items in playlist
    playlist.innerHTML = "";

    // go through all selected files
    for (const file of Array.from(this.files)) {
      // create list item and object url for the video file
      const listItem = document.createElement("li");
      listItem.objUrl = URL.createObjectURL(file);
      listItem.textContent = file.name;

      // give list item a click event listener for the corresponding video
      listItem.addEventListener("click", function (e) {
        this.classList.add("played");
        video.src = this.objUrl;
        video.audioTracks = this.objUrl;
      });

      // append li to the list
      playlist.appendChild(listItem);
    }

    // show the playlist for a moment
    playlist.classList.add("fadeout");
  },
  false /* don't capture */
);

// remove playlist fadeout after the animation ends, so it can be retriggered
playlist.addEventListener("animationend", (e) => {
  playlist.classList.remove("fadeout");
});
