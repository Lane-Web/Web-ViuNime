(function () {
  if (typeof playlist === 'undefined' || !playlist.length) return;

  const get = id => document.getElementById(id);
  const bgMusic    = get('bgMusic');
  const popup      = get('musicPopup');
  const closeBtn   = get('musicClose');
  const toggleBtn  = get('musicToggleBtn');
  const toggleIco  = get('toggleIcon');
  const toggleLbl  = get('toggleLabel');
  const coverWrap  = get('coverWrap');
  const coverIco   = get('coverIcon');
  const coverImg   = get('coverImg');
  const titleEl    = get('musicTitleEl');
  const artistEl   = get('musicArtistEl');
  const playBtn    = get('playPauseBtn');
  const prevBtn    = get('prevMusicBtn');
  const nextBtn    = get('nextMusicBtn');
  const progBar    = get('musicProgressBar');
  const progFill   = get('musicProgressFill');
  const curTime    = get('musicCurrentTime');
  const durTime    = get('musicDuration');
  const plContainer = get('playlistContainer');

  if (!bgMusic || !popup) return;

  let idx = 0, playing = false;

  const fmt = s => isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  const openPopup  = () => { popup.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const closePopup = () => { popup.classList.remove('active'); document.body.style.overflow = ''; };

  toggleBtn.addEventListener('click', openPopup);
  closeBtn.addEventListener('click', closePopup);

  function buildPlaylist() {
    if (!plContainer) return;
    plContainer.innerHTML = '';
    playlist.forEach((song, i) => {
      const item = document.createElement('div');
      item.className = 'vn-pl-item' + (i === idx ? ' active' : '');
      item.onclick = () => playTrack(i);

      const thumb = document.createElement('div');
      thumb.className = 'vn-pl-thumb';
      if (song.cover) {
        const img = document.createElement('img');
        img.src = song.cover; img.alt = song.title;
        img.onerror = () => { img.remove(); thumb.innerHTML = '<i class="fas fa-music"></i>'; };
        thumb.appendChild(img);
      } else thumb.innerHTML = '<i class="fas fa-music"></i>';

      const info = document.createElement('div');
      info.style.flex = '1; min-width:0';
      info.innerHTML = `<p class="vn-pl-title text-truncate">${song.title}</p><p class="vn-pl-artist text-truncate">${song.artist}</p>`;

      const ic = document.createElement('i');
      ic.className = 'fas fa-play text-truncate';
      ic.style.cssText = `color:var(--vn-teal);opacity:${i===idx?1:0};transition:.2s;font-size:.75rem;`;
      item.onmouseenter = () => ic.style.opacity = 1;
      item.onmouseleave = () => { if (i !== idx) ic.style.opacity = 0; };

      item.append(thumb, info, ic);
      plContainer.appendChild(item);
    });
  }

  function loadTrack(i) {
    idx = i;
    const s = playlist[i];
    bgMusic.src = s.src;
    titleEl.textContent  = s.title;
    artistEl.textContent = s.artist;
    if (s.cover) {
      coverImg.src = s.cover; coverImg.style.display = 'block';
      coverIco.style.display = 'none';
      coverImg.onerror = () => { coverImg.style.display='none'; coverIco.style.display=''; };
    } else { coverImg.style.display='none'; coverIco.style.display=''; }
    progFill.style.width = '0%';
    curTime.textContent = '0:00'; durTime.textContent = '0:00';
    buildPlaylist();
  }

  function setPlayState(state) {
    playing = state;
    playBtn.innerHTML = state ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (state) { coverWrap.classList.add('spinning'); toggleBtn.classList.add('playing'); toggleIco.className='fas fa-pause'; if(toggleLbl) toggleLbl.textContent='Playing'; }
    else        { coverWrap.classList.remove('spinning'); toggleBtn.classList.remove('playing'); toggleIco.className='fas fa-music'; if(toggleLbl) toggleLbl.textContent='Music'; }
  }

  function playTrack(i) {
    loadTrack(i);
    bgMusic.play().then(() => setPlayState(true))
      .catch(() => { artistEl.textContent = '⚠️ File tidak ditemukan. Jalankan via Live Server.'; });
  }

  function togglePlay() {
    if (playing) { bgMusic.pause(); setPlayState(false); }
    else {
      if (!bgMusic.src || bgMusic.src === location.href) loadTrack(0);
      bgMusic.play().then(() => setPlayState(true)).catch(()=>{});
    }
  }

  const nextTrack = () => playTrack((idx+1) % playlist.length);
  const prevTrack = () => { if (bgMusic.currentTime > 3) bgMusic.currentTime=0; else playTrack((idx-1+playlist.length)%playlist.length); };

  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);

  progBar.addEventListener('click', e => {
    if (!bgMusic.duration) return;
    const r = progBar.getBoundingClientRect();
    bgMusic.currentTime = ((e.clientX - r.left) / r.width) * bgMusic.duration;
  }); 

  bgMusic.addEventListener('timeupdate', () => {
    if (!bgMusic.duration) return;
    progFill.style.width = (bgMusic.currentTime / bgMusic.duration * 100) + '%';
    curTime.textContent = fmt(bgMusic.currentTime);
  });
  bgMusic.addEventListener('loadedmetadata', () => durTime.textContent = fmt(bgMusic.duration));
  bgMusic.addEventListener('ended', nextTrack);
  bgMusic.addEventListener('error', () => { setPlayState(false); });

  buildPlaylist();
  loadTrack(0);
})();