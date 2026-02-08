export function getYouTubeThumbnail(url: string | string[] | null | undefined) {
  if (!url) return null;

  // Helper function for a single string
  const getSingle = (singleUrl: string) => {
    if (typeof singleUrl !== "string") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = singleUrl.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` 
      : null;
  };

  // 🛡️ Logic: If Array, map it. If String, process it.
  if (Array.isArray(url)) {
    return url.map(u => getSingle(u)).filter(Boolean) as string[];
  }

  return getSingle(url);
}
