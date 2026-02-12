const ENSEMBL_BASE = 'https://rest.ensembl.org'

export interface EnsemblVariant {
  name: string
  source: string
  mappings: {
    seq_region_name: string
    start: number
    end: number
    allele_string: string
    strand: number
  }[]
  MAF: number | null
  ambiguity: string
  ancestral_allele: string | null
  clinical_significance: string[]
  most_severe_consequence: string
}

export interface EnsemblGeneInfo {
  id: string
  display_name: string
  description: string
  biotype: string
  seq_region_name: string
  start: number
  end: number
  strand: number
}

export async function lookupVariant(rsid: string): Promise<EnsemblVariant | null> {
  try {
    const res = await fetch(`${ENSEMBL_BASE}/variation/human/${rsid}?content-type=application/json`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getGeneInfo(symbol: string): Promise<EnsemblGeneInfo | null> {
  try {
    const searchRes = await fetch(
      `${ENSEMBL_BASE}/xrefs/symbol/homo_sapiens/${symbol}?content-type=application/json`
    )
    if (!searchRes.ok) return null
    const refs = await searchRes.json()
    const geneRef = refs.find((r: any) => r.type === 'gene')
    if (!geneRef) return null

    const geneRes = await fetch(
      `${ENSEMBL_BASE}/lookup/id/${geneRef.id}?content-type=application/json`
    )
    if (!geneRes.ok) return null
    return await geneRes.json()
  } catch {
    return null
  }
}

export async function getPopulationFrequencies(
  rsid: string
): Promise<{ population: string; frequency: number }[]> {
  try {
    const res = await fetch(
      `${ENSEMBL_BASE}/variation/human/${rsid}?pops=1;content-type=application/json`
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.populations || [])
      .filter((p: any) => p.frequency && p.population)
      .map((p: any) => ({
        population: p.population,
        frequency: p.frequency,
      }))
      .slice(0, 20)
  } catch {
    return []
  }
}
