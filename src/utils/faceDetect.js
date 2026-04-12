// Smart auto-centering crop
// Analyzes brightness to find face region

export const detectFaceAndCrop = (imageElement) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const imgW = imageElement.naturalWidth || imageElement.width
    const imgH = imageElement.naturalHeight || imageElement.height

    // Sample at smaller size for performance
    const sampleW = 100
    const sampleH = Math.round(imgH * (100 / imgW))
    canvas.width = sampleW
    canvas.height = sampleH

    ctx.drawImage(imageElement, 0, 0, sampleW, sampleH)
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data

    // Find skin tone pixels to locate face
    let minX = sampleW, maxX = 0, minY = sampleH, maxY = 0
    let skinCount = 0

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const i = (y * sampleW + x) * 4
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
        if (a < 10) continue // skip transparent pixels

        // Skin tone detection
        const isSkin = (
          r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15 &&
          r - b > 15 && r - g > 15
        )

        if (isSkin) {
          skinCount++
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    const passportRatio = 35 / 45

    // If skin detected — use it for centering
    if (skinCount > 30 && maxX > minX && maxY > minY) {
      const scaleX = imgW / sampleW
      const scaleY = imgH / sampleH

      const faceCenterX = ((minX + maxX) / 2) * scaleX
      const faceTop = minY * scaleY
      const faceH = (maxY - minY) * scaleY

      const cropH = faceH / 0.55
      const cropW = cropH * passportRatio

      const cropX = faceCenterX - cropW / 2
      const cropY = faceTop - cropH * 0.1

      resolve({
        x: Math.max(0, cropX),
        y: Math.max(0, cropY),
        width: Math.min(cropW, imgW - Math.max(0, cropX)),
        height: Math.min(cropH, imgH - Math.max(0, cropY))
      })
      return
    }

    // Fallback: center crop with top bias
    const cropW = imgW > imgH * passportRatio
      ? imgH * passportRatio * 0.85
      : imgW * 0.85
    const cropH = cropW / passportRatio
    const cropX = (imgW - cropW) / 2
    const cropY = (imgH - cropH) * 0.2

    resolve({
      x: Math.max(0, cropX),
      y: Math.max(0, cropY),
      width: cropW,
      height: cropH
    })
  })
}