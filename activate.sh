#!/bin/bash
# Script para activar el entorno virtual de AlphaGenome
#
# Uso: source activate.sh
#
# Esto activará el entorno virtual y configurará el PYTHONPATH

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activar entorno virtual
if [ -f "$SCRIPT_DIR/venv/bin/activate" ]; then
    source "$SCRIPT_DIR/venv/bin/activate"
    export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"
    echo "✓ Entorno AlphaGenome activado"
    echo "  Python: $(which python)"
    echo "  Versión: $(python --version)"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Configura tu API key en .env"
    echo "  2. Ejecuta: python test_installation.py"
    echo "  3. O inicia Python: python"
    echo ""
else
    echo "Error: No se encontró el entorno virtual."
    echo "Asegúrate de estar en el directorio correcto."
fi
