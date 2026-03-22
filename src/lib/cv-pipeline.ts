export type Corner = { x: number; y: number }

function orderCorners(pts: Corner[]): Corner[] {
  // sort by y to get top/bottom pairs, then by x within each pair
  const sorted = [...pts].sort((a, b) => a.y - b.y)
  const top = sorted.slice(0, 2).sort((a, b) => a.x - b.x)
  const bot = sorted.slice(2).sort((a, b) => a.x - b.x)
  // top-left, top-right, bottom-right, bottom-left
  return [top[0], top[1], bot[1], bot[0]]
}

export function detectDocumentCorners(canvas: HTMLCanvasElement): Corner[] | null {
  let src, gray, blurred, edges, dilated, kernel, contours, hierarchy;

  try {
    src = cv.imread(canvas)
    gray = new cv.Mat()
    blurred = new cv.Mat()
    edges = new cv.Mat()
    dilated = new cv.Mat()
    kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3))
    contours = new cv.MatVector()
    hierarchy = new cv.Mat()

    // step 1: reduce noise by using grayscale and blur
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)

    // step 2: canny edge detection
    cv.Canny(blurred, edges, 75, 200) // (..., lower, upper thresholds)

    // step 2.5: dilate the edges to close small gaps in the outline
    cv.dilate(edges, dilated, kernel)

    // step 3: finding all contours in the edge map
    cv.findContours(
      dilated,
      contours,
      hierarchy,
      cv.RETR_LIST,
      cv.CHAIN_APPROX_SIMPLE
    )

    // step 4: find the largest 4-sided contour, which will be the document
    let bestArea = 0
    let bestCorners: Corner[] | null = null
    const minArea = src.rows * src.cols * 0.05 // so that it's at least 5% of the image

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i)
      const perimeter = cv.arcLength(cnt, true)
      const approx = new cv.Mat()

      // approxPolyDP simplifies the contour to a polygon
      // 0.02 * perimeter is the tolerance
      cv.approxPolyDP(cnt, approx, 0.02 * perimeter, true)

      if (approx.rows === 4) {
        const area = cv.contourArea(approx)
        if (area > bestArea && area > minArea) {
          bestArea = area
          bestCorners = []
          for (let j = 0; j < 4; j++) {
            bestCorners.push({
                x: approx.data32S[j * 2],
                y: approx.data32S[j * 2 + 1],
            })
          }
        }
      }

      approx.delete()
      cnt.delete()
    }

    return bestCorners ? orderCorners(bestCorners) : null
  } catch (e) {
    console.error("Edge detection failed:", e)
    return null
  } finally {
    // cleanup step as OpenCV.js requires manual memory management
    ;[src, gray, blurred, edges, dilated, kernel, contours, hierarchy].forEach(
      (m) => { try { m?.delete() } catch {} }
    )
  }
}

function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function drawCornerOverlay(
  overlayCanvas: HTMLCanvasElement,
  corners: Corner[],
  imageWidth: number,
  imageHeight: number
) {
  overlayCanvas.width = imageWidth
  overlayCanvas.height = imageHeight

  const ctx = overlayCanvas.getContext("2d");
  if (!ctx) return

  const accent = getCSSVariable('--color-accent')
  const accentDark = getCSSVariable('--color-accent-dark')

  ctx.clearRect(0, 0, imageWidth, imageHeight)

  // visualizing the document outline
  ctx.beginPath()
  ctx.moveTo(corners[0].x, corners[0].y)
  corners.forEach((c) => ctx.lineTo(c.x, c.y))
  ctx.closePath()
  ctx.strokeStyle = accent
  ctx.lineWidth = Math.max(2, imageWidth * 0.003)
  ctx.stroke()

  // visualizing the corner dots for the user
  corners.forEach((c) => {
    ctx.beginPath()
    ctx.arc(c.x, c.y, Math.max(10, imageWidth * 0.02), 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.strokeStyle = accentDark
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

export function getDefaultCorners(width: number, height: number): Corner[] {
  const margin = Math.min(width, height) * 0.05
  return [
    { x: margin, y: margin },
    { x: width - margin, y: margin },
    { x: width - margin, y: height - margin },
    { x: margin, y: height - margin },
  ]
}