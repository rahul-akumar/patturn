import { ref } from 'vue'

export interface RadialMenuConfig {
  innerRadius?: number
  outerRadius: number
  itemCount: number
  itemSize?: number
}

export interface ArcResult {
  startAngle: number
  endAngle: number
  arcSpan: number
  isFullCircle: boolean
}

export interface ItemPosition {
  x: number
  y: number
  angle: number
  startAngle?: number
  endAngle?: number
}

/**
 * Calculate available arc based on position and container bounds
 * Angles: 0° = top, 90° = right, 180° = bottom, 270° = left
 */
export function calculateAvailableArc(
  x: number,
  y: number,
  containerRect: DOMRect,
  padding: number
): ArcResult {
  const spaceTop = y - containerRect.top
  const spaceBottom = containerRect.bottom - y
  const spaceLeft = x - containerRect.left
  const spaceRight = containerRect.right - x

  // Determine which directions are available
  const hasTop = spaceTop >= padding
  const hasBottom = spaceBottom >= padding
  const hasLeft = spaceLeft >= padding
  const hasRight = spaceRight >= padding

  // If all directions available, full circle
  if (hasTop && hasBottom && hasLeft && hasRight) {
    return { startAngle: 0, endAngle: 360, arcSpan: 360, isFullCircle: true }
  }

  let centerAngle = 0
  let spread = 180

  // Corner cases (90° arc)
  if (!hasTop && !hasLeft) {
    centerAngle = 135
    spread = 90
  } else if (!hasTop && !hasRight) {
    centerAngle = 225
    spread = 90
  } else if (!hasBottom && !hasLeft) {
    centerAngle = 45
    spread = 90
  } else if (!hasBottom && !hasRight) {
    centerAngle = 315
    spread = 90
  }
  // Edge cases (180° arc)
  else if (!hasTop) {
    centerAngle = 180
    spread = 180
  } else if (!hasBottom) {
    centerAngle = 0
    spread = 180
  } else if (!hasLeft) {
    centerAngle = 90
    spread = 180
  } else if (!hasRight) {
    centerAngle = 270
    spread = 180
  }

  let startAngle = centerAngle - spread / 2
  let endAngle = centerAngle + spread / 2

  // Normalize angles
  if (startAngle < 0) startAngle += 360
  if (endAngle > 360) endAngle -= 360

  // Handle wrap-around
  if (startAngle > endAngle) {
    endAngle += 360
  }

  return {
    startAngle,
    endAngle,
    arcSpan: endAngle - startAngle,
    isFullCircle: false
  }
}

/**
 * Calculate positions for circular button items
 */
export function calculateButtonPositions(
  startAngle: number,
  endAngle: number,
  radius: number,
  count: number
): ItemPosition[] {
  const positions: ItemPosition[] = []
  const arcSpan = endAngle - startAngle
  const isFullCircle = arcSpan >= 360

  const angleStep = isFullCircle
    ? 360 / count
    : arcSpan / Math.max(count - 1, 1)

  for (let i = 0; i < count; i++) {
    let angle = startAngle + i * angleStep

    while (angle >= 360) angle -= 360
    while (angle < 0) angle += 360

    const radian = (angle - 90) * (Math.PI / 180)

    positions.push({
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
      angle
    })
  }

  return positions
}

/**
 * Calculate wedge data for pie menu items
 */
export function calculateWedgePositions(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  count: number,
  gap: number = 2
): ItemPosition[] {
  const positions: ItemPosition[] = []
  const arcSpan = endAngle - startAngle
  const wedgeAngle = arcSpan / count
  const halfGap = gap / 2

  for (let i = 0; i < count; i++) {
    const wedgeStart = startAngle + i * wedgeAngle + halfGap
    const wedgeEnd = startAngle + (i + 1) * wedgeAngle - halfGap
    const midAngle = (wedgeStart + wedgeEnd) / 2

    // Normalize mid angle
    let normalizedAngle = midAngle
    while (normalizedAngle >= 360) normalizedAngle -= 360
    while (normalizedAngle < 0) normalizedAngle += 360

    // Calculate label position (outside the wedge)
    const labelRadius = outerRadius + 30
    const radian = (normalizedAngle - 90) * (Math.PI / 180)

    positions.push({
      x: Math.cos(radian) * labelRadius,
      y: Math.sin(radian) * labelRadius,
      angle: normalizedAngle,
      startAngle: wedgeStart,
      endAngle: wedgeEnd
    })
  }

  return positions
}

/**
 * Generate SVG path for a wedge/pie slice
 */
export function generateWedgePath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  centerX: number = 0,
  centerY: number = 0
): string {
  // Convert our angle system (0° = top) to SVG (0° = right)
  const toSvgAngle = (angle: number) => angle - 90

  const startRad = (toSvgAngle(startAngle) * Math.PI) / 180
  const endRad = (toSvgAngle(endAngle) * Math.PI) / 180

  const x1 = centerX + innerRadius * Math.cos(startRad)
  const y1 = centerY + innerRadius * Math.sin(startRad)
  const x2 = centerX + outerRadius * Math.cos(startRad)
  const y2 = centerY + outerRadius * Math.sin(startRad)
  const x3 = centerX + outerRadius * Math.cos(endRad)
  const y3 = centerY + outerRadius * Math.sin(endRad)
  const x4 = centerX + innerRadius * Math.cos(endRad)
  const y4 = centerY + innerRadius * Math.sin(endRad)

  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
    'Z'
  ].join(' ')
}

/**
 * Get angle from point relative to center
 */
export function getAngleFromPoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number {
  const dx = x - centerX
  const dy = y - centerY
  // atan2 gives angle from positive x-axis, we want from top (negative y-axis)
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  if (angle < 0) angle += 360
  return angle
}

/**
 * Check if angle is within a range (handles wrap-around)
 */
export function isAngleInRange(
  angle: number,
  startAngle: number,
  endAngle: number
): boolean {
  // Normalize angle
  while (angle < 0) angle += 360
  while (angle >= 360) angle -= 360

  // Handle wrap-around case
  if (startAngle > endAngle) {
    return angle >= startAngle || angle <= endAngle
  }

  return angle >= startAngle && angle <= endAngle
}

/**
 * Composable for radial menu state management
 */
export function useRadialMenu() {
  const isOpen = ref(false)
  const isAnimating = ref(false)
  const menuPosition = ref({ x: 0, y: 0 })
  const currentArc = ref<ArcResult>({ startAngle: 0, endAngle: 360, arcSpan: 360, isFullCircle: true })
  const openTimestamp = ref(0)
  const triggerElement = ref<HTMLElement | null>(null)
  const hoveredIndex = ref(-1)

  const open = (x: number, y: number, containerRect: DOMRect, padding: number, trigger?: HTMLElement) => {
    if (isAnimating.value) return false

    menuPosition.value = {
      x: x - containerRect.left,
      y: y - containerRect.top
    }

    currentArc.value = calculateAvailableArc(x, y, containerRect, padding)
    triggerElement.value = trigger || null
    openTimestamp.value = Date.now()
    isOpen.value = true

    return true
  }

  const close = () => {
    if (!isOpen.value || isAnimating.value) return false
    isOpen.value = false
    triggerElement.value = null
    openTimestamp.value = 0
    hoveredIndex.value = -1
    return true
  }

  const shouldIgnoreClick = (target: Node, menuEl?: HTMLElement | null, buttonEl?: HTMLElement | null) => {
    if (!isOpen.value || isAnimating.value) return true
    if (Date.now() - openTimestamp.value < 100) return true
    if (menuEl?.contains(target)) return true
    if (triggerElement.value?.contains(target)) return true
    if (buttonEl?.contains(target)) return true
    return false
  }

  return {
    isOpen,
    isAnimating,
    menuPosition,
    currentArc,
    openTimestamp,
    triggerElement,
    hoveredIndex,
    open,
    close,
    shouldIgnoreClick
  }
}
