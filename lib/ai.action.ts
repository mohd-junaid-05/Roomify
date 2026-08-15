import puter from '@heyputer/puter.js'
import { ROOMIFY_RENDER_PROMPT } from './constants';





/**
 * Fetches an image from the given URL and returns it as a base64 data URL.
 *
 * @param url - The URL of the image to fetch.
 * @returns A promise that resolves with the data URL string.
 */
export async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }

  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("FileReader failed to read the blob as a data URL."));
    };

    reader.readAsDataURL(blob);
  });
}


export const generate3DView = async ({sourceImage} : Generate3DViewParams) => {
    const dataUrl = sourceImage.startsWith('data')
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);

    const base64dData = dataUrl.split(',')[1]
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    if(!mimeType || !base64dData) throw new Error('Invaild source image payload')

    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT,{
        provider : 'gemini',
        model : 'gemini-2.5-flash-image-preview',
        input_image : base64dData,
        input_image_mime_type: mimeType,
        ratio : {w : 1024, h: 1024}
    })

    const rawImageUrl = (response as HTMLImageElement).src ?? null;

     if(!rawImageUrl) return {renderedImage : null, renderedPath: undefined}

     const renderedImage = rawImageUrl.startsWith('data:')
     ? rawImageUrl : await fetchAsDataUrl(rawImageUrl);

     return { renderedImage, renderedPath: undefined}
}