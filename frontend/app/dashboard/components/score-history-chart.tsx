'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import { ScoreHistoryPoint } from '@/lib/types/shinroe'
import { useTranslation } from '@/lib/i18n'

interface ScoreHistoryChartProps {
  history: ScoreHistoryPoint[]
  loading: boolean
  needsSubgraph?: boolean
}

// Calculate nice axis tick values for any scale
function calculateYAxisTicks(min: number, max: number, tickCount: number = 5): number[] {
  const range = max - min
  if (range === 0) return [min]

  // Calculate a nice step size
  const roughStep = range / (tickCount - 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const normalizedStep = roughStep / magnitude

  let niceStep: number
  if (normalizedStep <= 1) niceStep = 1 * magnitude
  else if (normalizedStep <= 2) niceStep = 2 * magnitude
  else if (normalizedStep <= 5) niceStep = 5 * magnitude
  else niceStep = 10 * magnitude

  // Round min down and max up to nice values
  const niceMin = Math.floor(min / niceStep) * niceStep
  const niceMax = Math.ceil(max / niceStep) * niceStep

  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax; v += niceStep) {
    ticks.push(Math.round(v * 100) / 100) // Handle floating point precision
  }

  return ticks
}

export function ScoreHistoryChart({ history, loading, needsSubgraph }: ScoreHistoryChartProps) {
  const { t, locale } = useTranslation()

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = useMemo(() => {
    if (!history.length) return null

    const leftPadding = 45 // Extra space for Y-axis labels
    const rightPadding = 20
    const topPadding = 20
    const bottomPadding = 25
    const width = 400
    const height = 200
    const chartWidth = width - leftPadding - rightPadding
    const chartHeight = height - topPadding - bottomPadding

    const scores = history.map((p) => p.score)
    const dataMin = Math.min(...scores)
    const dataMax = Math.max(...scores)

    // Add padding to data range (10% or at least 5 points)
    const dataPadding = Math.max((dataMax - dataMin) * 0.1, 5)
    const rawMin = Math.max(0, dataMin - dataPadding)
    const rawMax = dataMax + dataPadding

    // Calculate nice Y-axis ticks
    const yTicks = calculateYAxisTicks(rawMin, rawMax, 5)
    const minScore = yTicks[0]
    const maxScore = yTicks[yTicks.length - 1]
    const range = maxScore - minScore || 1 // Prevent division by zero

    const points = history.map((point, i) => {
      const xRatio = history.length === 1 ? 0.5 : i / (history.length - 1)
      const x = leftPadding + xRatio * chartWidth
      const y = topPadding + ((maxScore - point.score) / range) * chartHeight
      return { x, y, ...point }
    })

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - bottomPadding} L ${leftPadding} ${height - bottomPadding} Z`

    return {
      points, pathD, areaD, width, height,
      leftPadding, rightPadding, topPadding, bottomPadding,
      chartWidth, chartHeight,
      minScore, maxScore, yTicks
    }
  }, [history])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet" />
            {t('scoreHistory.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!history.length || !chartData) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet" />
            {t('scoreHistory.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {needsSubgraph ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-2">{t('scoreHistory.notConfigured')}</p>
              <p className="text-muted-foreground/50 text-xs">
                {t('scoreHistory.notConfiguredDesc')}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t('scoreHistory.noHistory')}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const { yTicks, leftPadding, topPadding, bottomPadding, chartHeight, minScore, maxScore } = chartData
  const range = maxScore - minScore || 1

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-violet" />
          {t('scoreHistory.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-48"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="[stop-color:hsl(var(--violet))]" stopOpacity="0.3" />
              <stop offset="100%" className="[stop-color:hsl(var(--violet))]" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis line */}
          <line
            x1={leftPadding}
            y1={topPadding}
            x2={leftPadding}
            y2={chartData.height - bottomPadding}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />

          {/* X-axis line */}
          <line
            x1={leftPadding}
            y1={chartData.height - bottomPadding}
            x2={chartData.width - chartData.rightPadding}
            y2={chartData.height - bottomPadding}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />

          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick, i) => {
            const y = topPadding + ((maxScore - tick) / range) * chartHeight
            return (
              <g key={i}>
                {/* Grid line */}
                <line
                  x1={leftPadding}
                  y1={y}
                  x2={chartData.width - chartData.rightPadding}
                  y2={y}
                  stroke="currentColor"
                  className="text-muted/20"
                  strokeDasharray="4 4"
                />
                {/* Tick mark */}
                <line
                  x1={leftPadding - 4}
                  y1={y}
                  x2={leftPadding}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                />
                {/* Label */}
                <text
                  x={leftPadding - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* X-axis tick marks and labels */}
          {chartData.points.map((point, i) => (
            <g key={`x-${i}`}>
              {/* Tick mark */}
              <line
                x1={point.x}
                y1={chartData.height - bottomPadding}
                x2={point.x}
                y2={chartData.height - bottomPadding + 4}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
              />
              {/* Label */}
              <text
                x={point.x}
                y={chartData.height - bottomPadding + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {formatDate(point.timestamp)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={chartData.areaD} fill="url(#scoreGradient)" />

          {/* Line */}
          <path
            d={chartData.pathD}
            fill="none"
            className="stroke-violet"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="4" className="fill-violet" />
              <circle cx={point.x} cy={point.y} r="6" className="fill-violet" opacity="0.3" />
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  )
}
