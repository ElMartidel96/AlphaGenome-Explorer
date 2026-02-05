"""
Export API Routes

Endpoints for exporting results in various formats.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ..models import ExportRequest, ExportFormat
from ..services.export_service import export_service

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.post(
    "/download",
    summary="Download results in specified format",
)
async def download_export(request: ExportRequest):
    """
    Export analysis results in the specified format.

    Supported formats:
    - **json**: Structured JSON (for APIs, copy-paste)
    - **csv**: Comma-separated values (for Excel, analysis)
    - **tsv**: Tab-separated values (for bioinformatics tools)
    - **markdown**: Formatted text (for documentation, GitHub)
    - **pdf**: PDF report (for clinical, publication)
    - **vcf**: VCF format (for bioinformatics pipelines)
    - **xlsx**: Excel workbook (for enterprise use)
    """
    try:
        content, content_type, filename = export_service.export(
            data=request.data,
            format=request.format,
            filename=request.filename,
        )

        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
            },
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post(
    "/clipboard/{format}",
    summary="Get text for clipboard",
)
async def get_clipboard_text(
    format: str,
    request: ExportRequest,
):
    """
    Get formatted text ready for copying to clipboard.

    Supported formats:
    - **markdown**: Formatted markdown text
    - **json**: Pretty-printed JSON
    - **tsv**: Tab-separated for pasting into spreadsheets
    """
    if format not in ["markdown", "json", "tsv"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid format for clipboard: {format}. Use 'markdown', 'json', or 'tsv'",
        )

    try:
        text = export_service.get_copyable_text(request.data, format)
        return {"text": text, "format": format}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/formats",
    summary="List available export formats",
)
async def list_formats():
    """
    Get the list of available export formats with descriptions.
    """
    return {
        "formats": [
            {
                "id": "json",
                "name": "JSON",
                "extension": ".json",
                "description": "Structured data format, ideal for API integration",
                "copy_paste": True,
                "download": True,
            },
            {
                "id": "csv",
                "name": "CSV",
                "extension": ".csv",
                "description": "Comma-separated values, opens in Excel",
                "copy_paste": False,
                "download": True,
            },
            {
                "id": "tsv",
                "name": "TSV",
                "extension": ".tsv",
                "description": "Tab-separated values, easy to paste into spreadsheets",
                "copy_paste": True,
                "download": True,
            },
            {
                "id": "markdown",
                "name": "Markdown",
                "extension": ".md",
                "description": "Formatted text, great for documentation and GitHub",
                "copy_paste": True,
                "download": True,
            },
            {
                "id": "pdf",
                "name": "PDF Report",
                "extension": ".pdf",
                "description": "Professional report format for clinical use",
                "copy_paste": False,
                "download": True,
            },
            {
                "id": "vcf",
                "name": "VCF",
                "extension": ".vcf",
                "description": "Variant Call Format with AlphaGenome annotations",
                "copy_paste": False,
                "download": True,
            },
            {
                "id": "xlsx",
                "name": "Excel",
                "extension": ".xlsx",
                "description": "Excel workbook with multiple sheets",
                "copy_paste": False,
                "download": True,
            },
        ],
        "recommended": {
            "for_sharing": "markdown",
            "for_analysis": "csv",
            "for_reports": "pdf",
            "for_pipelines": "vcf",
            "for_api": "json",
        },
    }
