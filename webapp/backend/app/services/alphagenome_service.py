"""
AlphaGenome API Service

This service wraps the AlphaGenome Python client to provide
a clean interface for the web application.

IMPORTANT: The API key is provided by the user per-request,
NOT stored on the server.
"""

import logging
from typing import Any
from datetime import datetime

from alphagenome.data import genome
from alphagenome.models import dna_client, variant_scorers
from alphagenome.interpretation import ism

from ..models import (
    OutputType,
    SequenceLength,
    Organism,
    ScorerType,
    GeneScore,
    VariantSummary,
    PredictionResult,
    TrackData,
    TrackMetadata,
)

logger = logging.getLogger(__name__)


# Mapping from our enums to AlphaGenome's
OUTPUT_TYPE_MAP = {
    OutputType.ATAC: dna_client.OutputType.ATAC,
    OutputType.CAGE: dna_client.OutputType.CAGE,
    OutputType.DNASE: dna_client.OutputType.DNASE,
    OutputType.RNA_SEQ: dna_client.OutputType.RNA_SEQ,
    OutputType.CHIP_HISTONE: dna_client.OutputType.CHIP_HISTONE,
    OutputType.CHIP_TF: dna_client.OutputType.CHIP_TF,
    OutputType.SPLICE_SITES: dna_client.OutputType.SPLICE_SITES,
    OutputType.SPLICE_SITE_USAGE: dna_client.OutputType.SPLICE_SITE_USAGE,
    OutputType.SPLICE_JUNCTIONS: dna_client.OutputType.SPLICE_JUNCTIONS,
    OutputType.CONTACT_MAPS: dna_client.OutputType.CONTACT_MAPS,
    OutputType.PROCAP: dna_client.OutputType.PROCAP,
}

SEQUENCE_LENGTH_MAP = {
    SequenceLength.LENGTH_16KB: dna_client.SEQUENCE_LENGTH_16KB,
    SequenceLength.LENGTH_100KB: dna_client.SEQUENCE_LENGTH_100KB,
    SequenceLength.LENGTH_500KB: dna_client.SEQUENCE_LENGTH_500KB,
    SequenceLength.LENGTH_1MB: dna_client.SEQUENCE_LENGTH_1MB,
}

ORGANISM_MAP = {
    Organism.HUMAN: dna_client.Organism.HOMO_SAPIENS,
    Organism.MOUSE: dna_client.Organism.MUS_MUSCULUS,
}

SCORER_MAP = {
    ScorerType.RNA_SEQ: "RNA_SEQ",
    ScorerType.DNASE: "DNASE",
    ScorerType.ATAC: "ATAC",
    ScorerType.SPLICING: "SPLICING",
    ScorerType.CONTACT_MAP: "CONTACT_MAP",
}


class AlphaGenomeService:
    """
    Service for interacting with AlphaGenome API.

    Each method requires an API key from the user.
    The key is NOT stored - it's used only for the current request.
    """

    def __init__(self):
        """Initialize service (no persistent state)."""
        self._clients: dict[str, dna_client.DnaClient] = {}

    def _get_client(self, api_key: str) -> dna_client.DnaClient:
        """
        Get or create an AlphaGenome client for the given API key.

        In production, consider caching clients with TTL.
        """
        # For simplicity, create a new client each time
        # In production, you might cache with a short TTL
        return dna_client.create(api_key)

    def _parse_variant(self, variant_str: str) -> genome.Variant:
        """Parse variant string into Variant object."""
        # Format: chr22:36201698:A>C
        parts = variant_str.split(":")
        chromosome = parts[0]
        position = int(parts[1])
        ref_alt = parts[2].split(">")
        ref = ref_alt[0]
        alt = ref_alt[1]

        return genome.Variant(
            chromosome=chromosome,
            position=position,
            reference_bases=ref,
            alternate_bases=alt,
        )

    def _interpret_score(self, raw_score: float, quantile: float) -> str:
        """Generate human-readable interpretation of score."""
        if abs(raw_score) < 0.01:
            return "No significant effect"

        direction = "increase" if raw_score > 0 else "decrease"

        if quantile > 0.95:
            strength = "Strong"
        elif quantile > 0.80:
            strength = "Moderate"
        elif quantile > 0.60:
            strength = "Weak"
        else:
            strength = "Minimal"

        return f"{strength} {direction}"

    def _determine_impact_level(self, scores: list[GeneScore]) -> str:
        """Determine overall impact level from scores."""
        if not scores:
            return "MODIFIER"

        max_quantile = max(s.quantile_score for s in scores)

        if max_quantile > 0.95:
            return "HIGH"
        elif max_quantile > 0.80:
            return "MODERATE"
        elif max_quantile > 0.60:
            return "LOW"
        else:
            return "MODIFIER"

    async def predict_variant(
        self,
        api_key: str,
        variant_str: str,
        outputs: list[OutputType],
        tissues: list[str],
        sequence_length: SequenceLength,
        organism: Organism,
    ) -> PredictionResult:
        """
        Predict effect of a variant.

        Args:
            api_key: User's AlphaGenome API key
            variant_str: Variant notation (chr22:36201698:A>C)
            outputs: Output types to predict
            tissues: Ontology terms for tissues
            sequence_length: Context sequence length
            organism: Target organism

        Returns:
            PredictionResult with tracks and scores
        """
        logger.info(f"Predicting variant: {variant_str}")

        # Get client with user's API key
        client = self._get_client(api_key)

        # Parse variant
        variant = self._parse_variant(variant_str)

        # Create interval centered on variant
        seq_len = SEQUENCE_LENGTH_MAP[sequence_length]
        interval = variant.reference_interval.resize(seq_len)

        # Map output types
        ag_outputs = [OUTPUT_TYPE_MAP[o] for o in outputs]
        ag_organism = ORGANISM_MAP[organism]

        # Make prediction
        variant_output = client.predict_variant(
            interval=interval,
            variant=variant,
            requested_outputs=ag_outputs,
            ontology_terms=tissues,
            organism=ag_organism,
        )

        # Also get scores
        scorer = variant_scorers.RECOMMENDED_VARIANT_SCORERS.get("RNA_SEQ")
        scores_list = []

        if scorer:
            try:
                score_result = client.score_variant(
                    interval=interval,
                    variant=variant,
                    variant_scorers=[scorer],
                    organism=ag_organism,
                )

                if score_result:
                    scores_df = variant_scorers.tidy_scores(
                        score_result, match_gene_strand=True
                    )

                    # Convert to our format
                    for _, row in scores_df.head(50).iterrows():
                        gene_score = GeneScore(
                            gene_id=row.get("gene_id", ""),
                            gene_name=row.get("gene_name", "Unknown"),
                            strand=row.get("strand", "."),
                            raw_score=float(row.get("raw_score", 0)),
                            quantile_score=float(row.get("quantile_score", 0)),
                            tissue=row.get("ontology_curie", tissues[0] if tissues else ""),
                            interpretation=self._interpret_score(
                                float(row.get("raw_score", 0)),
                                float(row.get("quantile_score", 0)),
                            ),
                        )
                        scores_list.append(gene_score)
            except Exception as e:
                logger.warning(f"Could not get scores: {e}")

        # Build summary
        affected_genes = list(set(s.gene_name for s in scores_list[:5]))
        top_effect = ""
        if scores_list:
            top = max(scores_list, key=lambda x: abs(x.raw_score))
            top_effect = f"{top.interpretation} in {top.gene_name} ({top.tissue})"

        summary = VariantSummary(
            variant=variant_str,
            impact_level=self._determine_impact_level(scores_list),
            affected_genes=affected_genes,
            top_effect=top_effect,
            confidence=0.85,  # Could be calculated from model
        )

        # Build result
        result = PredictionResult(
            timestamp=datetime.utcnow(),
            request_params={
                "variant": variant_str,
                "outputs": [o.value for o in outputs],
                "tissues": tissues,
                "sequence_length": sequence_length.value,
                "organism": organism.value,
            },
            summary=summary,
            scores=scores_list,
            tracks={},  # Tracks would be serialized here
        )

        return result

    async def predict_interval(
        self,
        api_key: str,
        chromosome: str,
        start: int,
        end: int,
        outputs: list[OutputType],
        tissues: list[str],
        organism: Organism,
    ) -> dict[str, Any]:
        """Predict for a genomic interval."""
        logger.info(f"Predicting interval: {chromosome}:{start}-{end}")

        client = self._get_client(api_key)

        interval = genome.Interval(
            chromosome=chromosome,
            start=start,
            end=end,
        )

        ag_outputs = [OUTPUT_TYPE_MAP[o] for o in outputs]
        ag_organism = ORGANISM_MAP[organism]

        output = client.predict_interval(
            interval=interval,
            requested_outputs=ag_outputs,
            ontology_terms=tissues,
            organism=ag_organism,
        )

        # Serialize output
        result = {
            "interval": {
                "chromosome": chromosome,
                "start": start,
                "end": end,
            },
            "outputs": {},
        }

        for output_type in outputs:
            attr_name = output_type.value.lower()
            track_data = getattr(output, attr_name, None)
            if track_data is not None:
                result["outputs"][output_type.value] = {
                    "shape": list(track_data.values.shape),
                    "metadata": track_data.metadata.to_dict(orient="records"),
                }

        return result

    async def score_variant(
        self,
        api_key: str,
        variant_str: str,
        scorers: list[ScorerType],
        sequence_length: SequenceLength,
        organism: Organism,
    ) -> list[GeneScore]:
        """Score a variant using specified scorers."""
        logger.info(f"Scoring variant: {variant_str}")

        client = self._get_client(api_key)
        variant = self._parse_variant(variant_str)
        seq_len = SEQUENCE_LENGTH_MAP[sequence_length]
        interval = variant.reference_interval.resize(seq_len)
        ag_organism = ORGANISM_MAP[organism]

        all_scores = []

        for scorer_type in scorers:
            scorer_name = SCORER_MAP[scorer_type]
            scorer = variant_scorers.RECOMMENDED_VARIANT_SCORERS.get(scorer_name)

            if scorer:
                try:
                    score_result = client.score_variant(
                        interval=interval,
                        variant=variant,
                        variant_scorers=[scorer],
                        organism=ag_organism,
                    )

                    if score_result:
                        scores_df = variant_scorers.tidy_scores(
                            score_result, match_gene_strand=True
                        )

                        for _, row in scores_df.iterrows():
                            all_scores.append(
                                GeneScore(
                                    gene_id=row.get("gene_id", ""),
                                    gene_name=row.get("gene_name", "Unknown"),
                                    strand=row.get("strand", "."),
                                    raw_score=float(row.get("raw_score", 0)),
                                    quantile_score=float(row.get("quantile_score", 0)),
                                    tissue=row.get("ontology_curie", ""),
                                    interpretation=self._interpret_score(
                                        float(row.get("raw_score", 0)),
                                        float(row.get("quantile_score", 0)),
                                    ),
                                )
                            )
                except Exception as e:
                    logger.warning(f"Error with scorer {scorer_name}: {e}")

        return all_scores

    async def run_ism(
        self,
        api_key: str,
        chromosome: str,
        start: int,
        end: int,
        ism_width: int,
        scorer_type: ScorerType,
        tissue: str,
        sequence_length: SequenceLength,
        organism: Organism,
    ) -> dict[str, Any]:
        """Run in silico mutagenesis."""
        logger.info(f"Running ISM: {chromosome}:{start}-{end}")

        client = self._get_client(api_key)
        seq_len = SEQUENCE_LENGTH_MAP[sequence_length]
        ag_organism = ORGANISM_MAP[organism]

        # Create intervals
        sequence_interval = genome.Interval(
            chromosome=chromosome,
            start=start,
            end=end,
        ).resize(seq_len)

        ism_interval = sequence_interval.resize(ism_width)

        # Get scorer
        scorer_name = SCORER_MAP[scorer_type]
        if scorer_name == "DNASE":
            scorer = variant_scorers.CenterMaskScorer(
                requested_output=dna_client.OutputType.DNASE,
                width=501,
                aggregation_type=variant_scorers.AggregationType.DIFF_MEAN,
            )
        else:
            scorer = variant_scorers.RECOMMENDED_VARIANT_SCORERS.get(scorer_name)

        if not scorer:
            raise ValueError(f"Unknown scorer: {scorer_type}")

        # Run ISM
        variant_scores = client.score_ism_variants(
            interval=sequence_interval,
            ism_interval=ism_interval,
            variant_scorers=[scorer],
            organism=ag_organism,
        )

        # Extract scores for specific tissue
        def extract_tissue_score(adata):
            if "ontology_curie" in adata.var.columns:
                mask = adata.var["ontology_curie"] == tissue
                if mask.any():
                    return float(adata.X[:, mask].flatten()[0])
            return 0.0

        scores = [extract_tissue_score(v[0]) for v in variant_scores]
        variants = [v[0].uns["variant"] for v in variant_scores]

        # Create ISM matrix
        ism_matrix = ism.ism_matrix(
            scores,
            variants,
            interval=ism_interval,
            multiply_by_sequence=True,
        )

        return {
            "interval": {
                "chromosome": chromosome,
                "start": ism_interval.start,
                "end": ism_interval.end,
            },
            "ism_matrix": ism_matrix.tolist(),
            "shape": list(ism_matrix.shape),
        }


# Singleton instance
alphagenome_service = AlphaGenomeService()
