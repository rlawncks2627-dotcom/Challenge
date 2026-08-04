/**
 * 인증샷은 브라우저에서 줄여서 올린다.
 * 요즘 휴대폰 사진은 한 장에 4~8MB다. 그대로 올리면 캠페인 하나가
 * 무료 스토리지를 금방 채우고, 피드 로딩도 느려진다.
 */
const MAX_EDGE = 1200;
const QUALITY = 0.82;
const MAX_BYTES = 2 * 1024 * 1024; // 버킷의 file_size_limit 과 같은 값

export async function resizeToWebP(file: File): Promise<Blob> {
  // from-image: 세로로 찍은 사진이 눕지 않게 EXIF 회전을 반영한다.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("이 브라우저에서는 사진을 처리할 수 없습니다.");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );

  if (!blob) throw new Error("사진을 변환하지 못했습니다. 다른 사진을 골라주세요.");
  if (blob.size > MAX_BYTES) {
    throw new Error("사진 용량이 너무 큽니다. 다른 사진을 골라주세요.");
  }

  return blob;
}
