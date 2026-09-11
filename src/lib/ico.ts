// Minimal ICO container writer (Microsoft ICONDIR format). Each entry
// embeds a full PNG image — modern Windows/browsers support PNG-in-ICO,
// which avoids reimplementing BMP/DIB encoding.
export function buildIco(
  images: { size: number; png: Uint8Array }[],
): Uint8Array {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;

  let offset = headerSize + dirSize;
  const dataOffsets: number[] = [];
  for (const img of images) {
    dataOffsets.push(offset);
    offset += img.png.byteLength;
  }

  const totalSize = offset;
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = icon
  view.setUint16(4, count, true);

  // ICONDIRENTRY per image
  images.forEach((img, i) => {
    const entryOffset = headerSize + i * dirEntrySize;
    const dim = img.size >= 256 ? 0 : img.size; // 0 means 256 in ICO format
    buffer[entryOffset] = dim; // width
    buffer[entryOffset + 1] = dim; // height
    buffer[entryOffset + 2] = 0; // color palette
    buffer[entryOffset + 3] = 0; // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, img.png.byteLength, true); // data size
    view.setUint32(entryOffset + 12, dataOffsets[i], true); // data offset
  });

  images.forEach((img, i) => {
    buffer.set(img.png, dataOffsets[i]);
  });

  return buffer;
}
