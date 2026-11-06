export const shareImageFiles = {
  home: 'home.v1.png',
  '88win': '88win.v1.jpg',
  'hwa-fong': 'hwa-fong.v1.jpg',
  fitzone: 'fitzone.v1.jpg',
  sss: 'sss.v1.jpg',
  jhanyu: 'jhanyu.v1.jpg',
  amd: 'amd.v1.jpg',
  huifa: 'huifa.v1.jpg',
} as const;

export function getShareImage(key: string): {
  path: string;
  type: 'image/png' | 'image/jpeg';
} {
  const file = shareImageFiles[key as keyof typeof shareImageFiles];
  if (!file) throw new Error(`Unknown share image key: ${key}`);

  return {
    path: `/og/${file}`,
    type: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
  };
}
