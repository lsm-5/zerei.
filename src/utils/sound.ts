export const playAchievementSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    // A simple rising arpeggio
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
};