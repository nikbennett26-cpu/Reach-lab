/* ---------- SAVED PLAYBACKS LIBRARY (localStorage) ---------- */






$('#playBtn').addEventListener('click',startPlayback);
$('#playRecShareBtn').addEventListener('click',()=>{
 const seq=recList();
 if(!seq.length){toast('Draw a tag first, then record your replay video');return}
 runPlaybackSeq(seq.slice(),null);
 setTimeout(()=>startPlayVideo(),80);
});
$('#playStop').addEventListener('click',()=>stopPlayback(true));
$('#playVidBtn').addEventListener('click',startPlayVideo);
updatePlaySpdBtn();

requestAnimationFrame(frame);
}
