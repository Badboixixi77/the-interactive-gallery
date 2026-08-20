/**
 * Extracts a color palette from an image using canvas sampling.
 * Returns an array of dominant hex colors.
 */
export async function extractPalette(
  imageUrl: string,
  maxColors: number = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve([]);

      // Downscale for performance
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const { data } = ctx.getImageData(0, 0, size, size);
      const colorMap: Map<string, number> = new Map();

      // Sample pixels with quantization to group similar colors
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency and take top colors
      const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxColors)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        });

      resolve(sorted);
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}
