const CLOUDINARY_CLOUD_NAME = 'jcpoo0uo';

export function optimizeImage(url: string, width: number = 900): string {
  if (!url) return '';

  if (url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }

  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto,w_${width},c_limit/${encodeURIComponent(url)}`;
  }

  return url;
}
