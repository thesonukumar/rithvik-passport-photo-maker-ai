// Smart passport crop without face-api.js
// Uses center-weighted crop with top-bias (faces are usually upper-center)

export const detectFaceAndCrop = (imageElement) => {
  return new Promise((resolve) => {
    const imgW = imageElement.naturalWidth
    const imgH = imageElement.naturalHeight

    // Passport ratio: 35mm x 45mm
    const passportRatio = 35 / 45

    // Strategy: crop a centered region with slight top bias
    // This works well for passport photos where subject is centered

    let cropW, cropH

    if (imgW / imgH > passportRatio) {
      // Image is wider than passport ratio — limit by height
      cropH = imgH * 0.92
      cropW = cropH * passportRatio
    } else {
      // Image is taller — limit by width
      cropW = imgW * 0.85
      cropH = cropW / passportRatio
    }

    // Center horizontally, slight top bias vertically (faces are upper half)
    const cropX = (imgW - cropW) / 2
    const cropY = (imgH - cropH) * 0.25  // 25% from top instead of 50% center

    resolve({
      x: Math.max(0, cropX),
      y: Math.max(0, cropY),
      width: Math.min(cropW, imgW - cropX),
      height: Math.min(cropH, imgH - cropY)
    })
  })
}