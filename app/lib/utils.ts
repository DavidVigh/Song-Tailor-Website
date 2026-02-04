export const getYouTubeThumbnail = (url: string | null | undefined) => {
  if (!url) return null;

  // Regular expression to handle various YouTube link formats:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // If we find a match and the ID is 11 characters (standard YouTube ID length)
  if (match && match[2].length === 11) {
    // 'mqdefault.jpg' is 320x180 (Medium Quality) - perfect for cards
    // 'hqdefault.jpg' is 480x360 (High Quality) - if you want it sharper
    return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
  }

  return null;
};