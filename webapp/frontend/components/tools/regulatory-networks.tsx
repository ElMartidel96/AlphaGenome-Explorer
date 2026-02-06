'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Title, Text, Button, Badge, TextInput } from '@tremor/react'
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ChevronRight,
  ExternalLink,
  Network,
  GitBranch,
  Circle,
  ArrowRight,
  Sparkles,
  Filter,
  Layers,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

// Types
interface GeneNode {
  id: string
  symbol: string
  name: string
  x: number
  y: number
  vx: number
  vy: number
  type: 'transcription_factor' | 'target_gene' | 'signaling' | 'metabolic'
  pathway: string[]
  expression: 'high' | 'medium' | 'low'
  description: string
  connections: number
}

interface Edge {
  source: string
  target: string
  type: 'activates' | 'represses' | 'binds'
  strength: number
}

interface Pathway {
  id: string
  name: string
  color: string
  genes: string[]
}

// Demo gene network data
const PATHWAYS: Pathway[] = [
  { id: 'p53', name: 'p53 Signaling', color: '#ef4444', genes: ['TP53', 'MDM2', 'CDKN1A', 'BAX', 'BBC3'] },
  { id: 'wnt', name: 'Wnt Signaling', color: '#3b82f6', genes: ['WNT1', 'CTNNB1', 'APC', 'AXIN1', 'TCF7'] },
  { id: 'notch', name: 'Notch Signaling', color: '#8b5cf6', genes: ['NOTCH1', 'JAG1', 'HES1', 'HEY1', 'RBPJ'] },
  { id: 'tgfb', name: 'TGF-β Signaling', color: '#10b981', genes: ['TGFB1', 'SMAD2', 'SMAD3', 'SMAD4', 'SMAD7'] },
  { id: 'nfkb', name: 'NF-κB Signaling', color: '#f59e0b', genes: ['NFKB1', 'RELA', 'IKBKB', 'NFKBIA', 'TNF'] },
]

const DEMO_GENES: GeneNode[] = [
  // p53 pathway
  { id: 'TP53', symbol: 'TP53', name: 'Tumor Protein P53', x: 400, y: 300, vx: 0, vy: 0, type: 'transcription_factor', pathway: ['p53'], expression: 'medium', description: 'Guardian of the genome - activates cell cycle arrest and apoptosis', connections: 8 },
  { id: 'MDM2', symbol: 'MDM2', name: 'MDM2 Proto-Oncogene', x: 300, y: 200, vx: 0, vy: 0, type: 'target_gene', pathway: ['p53'], expression: 'high', description: 'Negative regulator of p53', connections: 3 },
  { id: 'CDKN1A', symbol: 'CDKN1A', name: 'Cyclin Dependent Kinase Inhibitor 1A', x: 500, y: 200, vx: 0, vy: 0, type: 'target_gene', pathway: ['p53'], expression: 'medium', description: 'p21 - mediates G1 cell cycle arrest', connections: 4 },
  { id: 'BAX', symbol: 'BAX', name: 'BCL2 Associated X', x: 350, y: 400, vx: 0, vy: 0, type: 'target_gene', pathway: ['p53'], expression: 'low', description: 'Pro-apoptotic protein', connections: 2 },
  { id: 'BBC3', symbol: 'BBC3', name: 'BCL2 Binding Component 3', x: 450, y: 400, vx: 0, vy: 0, type: 'target_gene', pathway: ['p53'], expression: 'low', description: 'PUMA - apoptosis mediator', connections: 2 },

  // Wnt pathway
  { id: 'CTNNB1', symbol: 'CTNNB1', name: 'Catenin Beta 1', x: 200, y: 350, vx: 0, vy: 0, type: 'signaling', pathway: ['wnt'], expression: 'high', description: 'β-catenin - key effector of Wnt signaling', connections: 5 },
  { id: 'APC', symbol: 'APC', name: 'APC Regulator of WNT Signaling', x: 100, y: 300, vx: 0, vy: 0, type: 'signaling', pathway: ['wnt'], expression: 'medium', description: 'Tumor suppressor - regulates β-catenin', connections: 3 },
  { id: 'TCF7', symbol: 'TCF7', name: 'Transcription Factor 7', x: 200, y: 250, vx: 0, vy: 0, type: 'transcription_factor', pathway: ['wnt'], expression: 'medium', description: 'TCF/LEF family - Wnt target gene activation', connections: 4 },

  // Notch pathway
  { id: 'NOTCH1', symbol: 'NOTCH1', name: 'Notch Receptor 1', x: 600, y: 350, vx: 0, vy: 0, type: 'signaling', pathway: ['notch'], expression: 'medium', description: 'Cell fate determination receptor', connections: 4 },
  { id: 'HES1', symbol: 'HES1', name: 'Hes Family BHLH Transcription Factor 1', x: 650, y: 250, vx: 0, vy: 0, type: 'transcription_factor', pathway: ['notch'], expression: 'high', description: 'Notch target - transcriptional repressor', connections: 3 },
  { id: 'JAG1', symbol: 'JAG1', name: 'Jagged Canonical Notch Ligand 1', x: 550, y: 450, vx: 0, vy: 0, type: 'signaling', pathway: ['notch'], expression: 'medium', description: 'Notch ligand', connections: 2 },

  // Cross-pathway connectors
  { id: 'MYC', symbol: 'MYC', name: 'MYC Proto-Oncogene', x: 400, y: 150, vx: 0, vy: 0, type: 'transcription_factor', pathway: ['wnt', 'notch'], expression: 'high', description: 'Master regulator of cell proliferation', connections: 6 },
  { id: 'CCND1', symbol: 'CCND1', name: 'Cyclin D1', x: 300, y: 100, vx: 0, vy: 0, type: 'target_gene', pathway: ['wnt', 'notch'], expression: 'medium', description: 'Cell cycle regulator - G1/S transition', connections: 4 },
]

const DEMO_EDGES: Edge[] = [
  // p53 pathway edges
  { source: 'TP53', target: 'MDM2', type: 'activates', strength: 0.9 },
  { source: 'MDM2', target: 'TP53', type: 'represses', strength: 0.8 },
  { source: 'TP53', target: 'CDKN1A', type: 'activates', strength: 0.95 },
  { source: 'TP53', target: 'BAX', type: 'activates', strength: 0.7 },
  { source: 'TP53', target: 'BBC3', type: 'activates', strength: 0.75 },

  // Wnt pathway edges
  { source: 'APC', target: 'CTNNB1', type: 'represses', strength: 0.85 },
  { source: 'CTNNB1', target: 'TCF7', type: 'binds', strength: 0.9 },
  { source: 'TCF7', target: 'MYC', type: 'activates', strength: 0.8 },
  { source: 'TCF7', target: 'CCND1', type: 'activates', strength: 0.75 },

  // Notch pathway edges
  { source: 'JAG1', target: 'NOTCH1', type: 'binds', strength: 0.95 },
  { source: 'NOTCH1', target: 'HES1', type: 'activates', strength: 0.9 },
  { source: 'HES1', target: 'MYC', type: 'represses', strength: 0.6 },

  // Cross-pathway
  { source: 'MYC', target: 'CCND1', type: 'activates', strength: 0.85 },
  { source: 'TP53', target: 'MYC', type: 'represses', strength: 0.7 },
  { source: 'CDKN1A', target: 'CCND1', type: 'represses', strength: 0.65 },
]

// Node colors by type
const NODE_COLORS: Record<string, string> = {
  transcription_factor: '#8b5cf6',
  target_gene: '#3b82f6',
  signaling: '#10b981',
  metabolic: '#f59e0b',
}

export function RegulatoryNetworks() {
  const t = useTranslations()
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<GeneNode[]>(DEMO_GENES)
  const [edges] = useState<Edge[]>(DEMO_EDGES)
  const [selectedNode, setSelectedNode] = useState<GeneNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activePathway, setActivePathway] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState<'pathway' | 'gene' | 'detail'>('gene')

  // Simple force simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes]

        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]

          // Repulsion from other nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue
            const other = newNodes[j]
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 500 / (dist * dist)
            node.vx += (dx / dist) * force * 0.1
            node.vy += (dy / dist) * force * 0.1
          }

          // Attraction to connected nodes
          edges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
              const otherId = edge.source === node.id ? edge.target : edge.source
              const other = newNodes.find(n => n.id === otherId)
              if (other) {
                const dx = other.x - node.x
                const dy = other.y - node.y
                const dist = Math.sqrt(dx * dx + dy * dy) || 1
                node.vx += dx * 0.01 * edge.strength
                node.vy += dy * 0.01 * edge.strength
              }
            }
          })

          // Center gravity
          node.vx += (400 - node.x) * 0.001
          node.vy += (300 - node.y) * 0.001

          // Apply velocity with damping
          node.x += node.vx * 0.5
          node.y += node.vy * 0.5
          node.vx *= 0.9
          node.vy *= 0.9

          // Bounds
          node.x = Math.max(50, Math.min(750, node.x))
          node.y = Math.max(50, Math.min(550, node.y))
        }

        return newNodes
      })
    }, 50)

    return () => clearInterval(interval)
  }, [edges])

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.2))
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.2))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Search filter
  const filteredNodes = searchQuery
    ? nodes.filter(n =>
        n.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodes

  const highlightedNodeIds = new Set(
    activePathway
      ? PATHWAYS.find(p => p.id === activePathway)?.genes || []
      : filteredNodes.map(n => n.id)
  )

  // Get edge color
  const getEdgeColor = (edge: Edge) => {
    switch (edge.type) {
      case 'activates': return '#22c55e'
      case 'represses': return '#ef4444'
      case 'binds': return '#3b82f6'
      default: return '#9ca3af'
    }
  }

  // Render node size based on connections
  const getNodeSize = (node: GeneNode) => {
    const baseSize = 20
    return baseSize + Math.min(node.connections * 3, 15)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Network className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>Gene Regulatory Networks</Title>
            <Text>Explore interactive networks of genes, regulators, and pathways</Text>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <TextInput
              icon={Search}
              placeholder="Search genes (e.g., TP53, MYC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Pathway filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <div className="flex gap-1">
              {PATHWAYS.map(pathway => (
                <button
                  key={pathway.id}
                  onClick={() => setActivePathway(activePathway === pathway.id ? null : pathway.id)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    activePathway === pathway.id
                      ? 'text-white'
                      : 'bg-surface-muted text-body hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: activePathway === pathway.id ? pathway.color : undefined
                  }}
                >
                  {pathway.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l pl-4">
            <Button variant="secondary" size="xs" icon={ZoomOut} onClick={handleZoomOut} />
            <span className="text-sm text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="secondary" size="xs" icon={ZoomIn} onClick={handleZoomIn} />
            <Button variant="secondary" size="xs" icon={Maximize2} onClick={handleResetView} />
          </div>
        </div>
      </Card>

      {/* Main visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <Card className="lg:col-span-3 p-2">
          <div
            className="relative bg-gray-900 rounded-xl overflow-hidden"
            style={{ height: '500px' }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 600"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing"
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {edges.map((edge, idx) => {
                  const sourceNode = nodes.find(n => n.id === edge.source)
                  const targetNode = nodes.find(n => n.id === edge.target)
                  if (!sourceNode || !targetNode) return null

                  const isHighlighted = highlightedNodeIds.has(edge.source) && highlightedNodeIds.has(edge.target)
                  const isHovered = hoveredNode === edge.source || hoveredNode === edge.target

                  return (
                    <g key={idx}>
                      {/* Arrow marker definition */}
                      <defs>
                        <marker
                          id={`arrow-${idx}`}
                          markerWidth="10"
                          markerHeight="10"
                          refX="8"
                          refY="3"
                          orient="auto"
                        >
                          <path
                            d="M0,0 L0,6 L9,3 z"
                            fill={getEdgeColor(edge)}
                            opacity={isHighlighted ? 0.8 : 0.3}
                          />
                        </marker>
                      </defs>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={getEdgeColor(edge)}
                        strokeWidth={isHovered ? 3 : 2}
                        strokeOpacity={isHighlighted ? 0.7 : 0.2}
                        strokeDasharray={edge.type === 'represses' ? '5,5' : undefined}
                        markerEnd={`url(#arrow-${idx})`}
                      />
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isHighlighted = highlightedNodeIds.has(node.id)
                  const isHovered = hoveredNode === node.id
                  const isSelected = selectedNode?.id === node.id
                  const size = getNodeSize(node)
                  const pathwayColor = PATHWAYS.find(p => p.genes.includes(node.id))?.color || NODE_COLORS[node.type]

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      {/* Glow effect for selected */}
                      {isSelected && (
                        <circle
                          r={size + 8}
                          fill="none"
                          stroke={pathwayColor}
                          strokeWidth="3"
                          opacity="0.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main circle */}
                      <circle
                        r={size}
                        fill={pathwayColor}
                        opacity={isHighlighted ? 1 : 0.3}
                        stroke={isHovered || isSelected ? '#fff' : 'transparent'}
                        strokeWidth={2}
                      />

                      {/* Expression indicator */}
                      <circle
                        r={4}
                        cx={size - 5}
                        cy={-size + 5}
                        fill={
                          node.expression === 'high' ? '#22c55e' :
                          node.expression === 'medium' ? '#f59e0b' : '#ef4444'
                        }
                        opacity={isHighlighted ? 1 : 0.3}
                      />

                      {/* Label */}
                      <text
                        y={size + 15}
                        textAnchor="middle"
                        fill={isHighlighted ? '#fff' : '#6b7280'}
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {node.symbol}
                      </text>

                      {/* Hover tooltip */}
                      {isHovered && (
                        <g transform={`translate(${size + 10}, -30)`}>
                          <rect
                            x="0"
                            y="0"
                            width="200"
                            height="60"
                            rx="4"
                            fill="rgba(0,0,0,0.9)"
                          />
                          <text x="10" y="18" fill="#fff" fontSize="12" fontWeight="bold">
                            {node.symbol}
                          </text>
                          <text x="10" y="35" fill="#9ca3af" fontSize="10">
                            {node.name.substring(0, 28)}...
                          </text>
                          <text x="10" y="50" fill="#9ca3af" fontSize="10">
                            {node.connections} connections
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </g>

              {/* Legend */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="140" height="100" rx="4" fill="rgba(0,0,0,0.7)" />
                <text x="10" y="20" fill="#fff" fontSize="11" fontWeight="bold">Legend</text>

                <circle cx="20" cy="38" r="6" fill="#22c55e" />
                <text x="35" y="42" fill="#9ca3af" fontSize="9">Activates</text>

                <circle cx="90" cy="38" r="6" fill="#ef4444" />
                <text x="105" y="42" fill="#9ca3af" fontSize="9">Represses</text>

                <line x1="10" y1="58" x2="40" y2="58" stroke="#3b82f6" strokeWidth="2" />
                <text x="50" y="62" fill="#9ca3af" fontSize="9">Binds</text>

                <circle cx="20" cy="78" r="6" fill="#8b5cf6" />
                <text x="35" y="82" fill="#9ca3af" fontSize="9">TF</text>

                <circle cx="70" cy="78" r="6" fill="#3b82f6" />
                <text x="85" y="82" fill="#9ca3af" fontSize="9">Target</text>
              </g>
            </svg>
          </div>
        </Card>

        {/* Details Panel */}
        <Card className="lg:col-span-1">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  size="lg"
                  style={{ backgroundColor: PATHWAYS.find(p => p.genes.includes(selectedNode.id))?.color || NODE_COLORS[selectedNode.type] }}
                >
                  {selectedNode.symbol}
                </Badge>
                <Badge
                  color={
                    selectedNode.expression === 'high' ? 'green' :
                    selectedNode.expression === 'medium' ? 'yellow' : 'red'
                  }
                  size="xs"
                >
                  {selectedNode.expression} expr.
                </Badge>
              </div>

              <div>
                <p className="font-medium text-title">{selectedNode.name}</p>
                <p className="text-sm text-muted mt-1">{selectedNode.description}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted uppercase mb-2">Type</p>
                <Badge color="gray">{selectedNode.type.replace('_', ' ')}</Badge>
              </div>

              <div>
                <p className="text-xs font-medium text-muted uppercase mb-2">Pathways</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.pathway.map(p => {
                    const pathway = PATHWAYS.find(pw => pw.id === p)
                    return pathway ? (
                      <span
                        key={p}
                        className="px-2 py-1 text-xs text-white rounded"
                        style={{ backgroundColor: pathway.color }}
                      >
                        {pathway.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted uppercase mb-2">Connections ({selectedNode.connections})</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, idx) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source
                      const other = nodes.find(n => n.id === otherId)
                      const isSource = edge.source === selectedNode.id
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs p-2 bg-surface-soft rounded cursor-pointer hover:bg-surface-muted"
                          onClick={() => setSelectedNode(other || null)}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            edge.type === 'activates' ? 'bg-success-soft0' :
                            edge.type === 'represses' ? 'bg-danger-soft0' : 'bg-info-soft0'
                          }`} />
                          <span className="text-body">
                            {isSource ? edge.type : `${edge.type} by`}
                          </span>
                          <span className="font-medium text-title">{other?.symbol}</span>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex gap-2">
                  <Button variant="secondary" size="xs" icon={ExternalLink} className="flex-1">
                    KEGG
                  </Button>
                  <Button variant="secondary" size="xs" icon={ExternalLink} className="flex-1">
                    Reactome
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <Network className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Click on a gene node to see details</p>
            </div>
          )}
        </Card>
      </div>

      {/* Pathways Legend */}
      <Card>
        <Title className="mb-4">Signaling Pathways</Title>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PATHWAYS.map(pathway => (
            <div
              key={pathway.id}
              onClick={() => setActivePathway(activePathway === pathway.id ? null : pathway.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                activePathway === pathway.id
                  ? 'border-current shadow-lg'
                  : 'border-transparent hover:border-adaptive'
              }`}
              style={{ borderColor: activePathway === pathway.id ? pathway.color : undefined }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: pathway.color }}
                />
                <p className="font-medium text-sm text-title">{pathway.name}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {pathway.genes.slice(0, 3).map(gene => (
                  <span key={gene} className="text-xs text-muted">{gene}</span>
                ))}
                {pathway.genes.length > 3 && (
                  <span className="text-xs text-subtle">+{pathway.genes.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
