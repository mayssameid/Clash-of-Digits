// background music system that works across all pages
// using "Gaming Game Minecraft Background Music" from pixabay
// found it here: https://pixabay.com/music/

let backgroundMusic;
let isPlaying = false;

// when page loads, this sets up the music system
document.addEventListener('DOMContentLoaded', function() {
    // creating audio element for background music
    backgroundMusic = new Audio('gaming-game-minecraft-background-music-387000.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // checking if music should continue from previous page
    backgroundMusic.addEventListener('canplay', checkMusicState);
    
  // creating music toggle button that floats on screen
  const musicButton = document.createElement('button');
  musicButton.id = 'musicToggleBtn';
  musicButton.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 1000;
    background: #0fcece; color: white; border: none;
    padding: 10px 15px; border-radius: 25px; cursor: pointer;
    font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `;
  
  // making button smaller on mobile devices
  if (window.innerWidth <= 768) {
    musicButton.style.cssText += `
      bottom: 15px; right: 15px; padding: 8px 12px; font-size: 14px;
    `;
  }
  
  // adjusting button size when window is resized
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      musicButton.style.bottom = '15px';
      musicButton.style.right = '15px';
      musicButton.style.padding = '8px 12px';
      musicButton.style.fontSize = '14px';
    } else {
      musicButton.style.bottom = '20px';
      musicButton.style.right = '20px';
      musicButton.style.padding = '10px 15px';
      musicButton.style.fontSize = '16px';
    }
  });    updateButtonState(musicButton);
    musicButton.addEventListener('click', () => toggleMusic(musicButton));
    document.body.appendChild(musicButton);
});

// checking if music should be playing based on what was saved
function checkMusicState() {
    if (sessionStorage.getItem('musicPlaying') === 'true') {
        const musicButton = document.getElementById('musicToggleBtn');
        if (musicButton) startMusic(musicButton);
    }
}

// switching music on/off when button is clicked
function toggleMusic(button) {
    if (!isPlaying) {
        startMusic(button);
    } else {
        stopMusic(button);
    }
}

// starting music
function startMusic(button) {
    backgroundMusic.play().then(() => {
        isPlaying = true;
        sessionStorage.setItem('musicPlaying', 'true');
        updateButtonState(button);
    }).catch(() => {
        alert('Could not play music!');
    });
}

// stopping music
function stopMusic(button) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isPlaying = false;
    sessionStorage.setItem('musicPlaying', 'false');
    updateButtonState(button);
}

// changing button appearance based on whether music is playing or not
function updateButtonState(button) {
    const musicState = sessionStorage.getItem('musicPlaying');
    if (musicState === 'true' || isPlaying) {
        button.innerHTML = '🔇 Stop Music';
        button.style.background = '#e94560';
    } else {
        button.innerHTML = '🎵 Play Music';
        button.style.background = '#0fcece';
    }
}

