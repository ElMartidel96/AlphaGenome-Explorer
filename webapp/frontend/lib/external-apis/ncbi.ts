const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

export interface NCBIGeneResult {
  uid: string
  name: string
  description: string
  chromosome: string
  maplocation: string
  organism: string
  summary: string
}

export async function searchGene(query: string): Promise<NCBIGeneResult[]> {
  const searchUrl = `${NCBI_BASE}/esearch.fcgi?db=gene&term=${encodeURIComponent(query)}[Gene Name]+AND+Homo+sapiens[Organism]&retmode=json&retmax=5`
  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()

  const ids = searchData.esearchresult?.idlist
  if (!ids || ids.length === 0) return []

  const summaryUrl = `${NCBI_BASE}/esummary.fcgi?db=gene&id=${ids.join(',')}&retmode=json`
  const summaryRes = await fetch(summaryUrl)
  const summaryData = await summaryRes.json()

  return ids.map((id: string) => {
    const item = summaryData.result?.[id]
    if (!item) return null
    return {
      uid: id,
      name: item.name || '',
      description: item.description || '',
      chromosome: item.chromosome || '',
      maplocation: item.maplocation || '',
      organism: item.organism?.scientificname || 'Homo sapiens',
      summary: item.summary || '',
    }
  }).filter(Boolean) as NCBIGeneResult[]
}

export async function getGeneSummary(geneId: string): Promise<NCBIGeneResult | null> {
  const url = `${NCBI_BASE}/esummary.fcgi?db=gene&id=${geneId}&retmode=json`
  const res = await fetch(url)
  const data = await res.json()
  const item = data.result?.[geneId]
  if (!item) return null

  return {
    uid: geneId,
    name: item.name || '',
    description: item.description || '',
    chromosome: item.chromosome || '',
    maplocation: item.maplocation || '',
    organism: item.organism?.scientificname || 'Homo sapiens',
    summary: item.summary || '',
  }
}
