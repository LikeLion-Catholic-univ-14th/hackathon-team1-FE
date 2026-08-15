import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

// A4 여백 (pt)
const MARGIN = 32
// 카드 사이 간격
const GAP = 16
// 페이지 배경 — 화면과 같은 #f4f6f9
const PAGE_BG = [244, 246, 249]

// data-pdf-hide 가 붙은 요소(저장 버튼 등)는 캡처에서 뺀다
const captureOptions = {
  pixelRatio: 2,
  backgroundColor: '#f4f6f9',
  cacheBust: true,
  filter: (node) => !node?.dataset?.pdfHide,
}

const loadImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })

const paintBackground = (pdf, width, height) => {
  pdf.setFillColor(...PAGE_BG)
  pdf.rect(0, 0, width, height, 'F')
}

// 카드를 한 장씩 떠서 A4 에 얹는다.
// 페이지에 안 들어가면 다음 장으로 넘겨서, 카드가 중간에 잘리지 않게 한다.
export const exportBlocksToPdf = async (element, fileName) => {
  if (!element) {
    return
  }

  // 헤더 + 카드 6장. reportRef 의 직계 자식이 곧 한 블록이다
  const blocks = Array.from(element.children).filter(
    (node) => !node.dataset?.pdfHide,
  )

  if (blocks.length === 0) {
    return
  }

  const shots = []

  // 순차로 캡처한다. 동시에 돌리면 브라우저가 버거워한다
  for (const block of blocks) {
    const dataUrl = await toPng(block, captureOptions)
    const image = await loadImage(dataUrl)
    shots.push({ dataUrl, ratio: image.height / image.width })
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const contentBottom = pageHeight - MARGIN

  paintBackground(pdf, pageWidth, pageHeight)

  let cursorY = MARGIN

  shots.forEach((shot, index) => {
    let drawWidth = contentWidth
    let drawHeight = contentWidth * shot.ratio

    // 카드 하나가 한 페이지보다 길면 페이지에 맞춰 줄인다
    const maxHeight = contentBottom - MARGIN

    if (drawHeight > maxHeight) {
      drawHeight = maxHeight
      drawWidth = drawHeight / shot.ratio
    }

    // 이번 카드가 남은 공간에 안 들어가면 새 페이지로
    const isFirst = index === 0

    if (!isFirst && cursorY + drawHeight > contentBottom) {
      pdf.addPage()
      paintBackground(pdf, pageWidth, pageHeight)
      cursorY = MARGIN
    }

    const drawX = MARGIN + (contentWidth - drawWidth) / 2

    pdf.addImage(shot.dataUrl, 'PNG', drawX, cursorY, drawWidth, drawHeight)
    cursorY += drawHeight + GAP
  })

  pdf.save(fileName)
}
