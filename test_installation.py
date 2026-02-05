#!/usr/bin/env python3
"""
Test de instalación de AlphaGenome
==================================
Verifica que AlphaGenome está correctamente instalado y configurado.
"""

import sys


def check_python_version():
    """Verifica versión de Python."""
    print("1. Verificando Python...")
    version = sys.version_info
    if version >= (3, 10):
        print(f"   ✓ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"   ✗ Python {version.major}.{version.minor} - Requiere 3.10+")
        return False


def check_alphagenome_import():
    """Verifica que AlphaGenome se puede importar."""
    print("2. Verificando AlphaGenome...")
    try:
        import alphagenome
        print(f"   ✓ AlphaGenome v{alphagenome.__version__}")
        return True
    except ImportError as e:
        print(f"   ✗ Error importando AlphaGenome: {e}")
        return False


def check_core_modules():
    """Verifica módulos core de AlphaGenome."""
    print("3. Verificando módulos core...")
    modules = [
        ('alphagenome.data.genome', 'genome'),
        ('alphagenome.models.dna_client', 'dna_client'),
        ('alphagenome.visualization.plot_components', 'plot_components'),
        ('alphagenome.models.variant_scorers', 'variant_scorers'),
        ('alphagenome.interpretation.ism', 'ism'),
    ]
    all_ok = True
    for module_path, name in modules:
        try:
            __import__(module_path)
            print(f"   ✓ {name}")
        except ImportError as e:
            print(f"   ✗ {name}: {e}")
            all_ok = False
    return all_ok


def check_dependencies():
    """Verifica dependencias principales."""
    print("4. Verificando dependencias...")
    deps = [
        ('numpy', 'numpy'),
        ('pandas', 'pandas'),
        ('matplotlib', 'matplotlib'),
        ('scipy', 'scipy'),
        ('grpc', 'grpcio'),
    ]
    all_ok = True
    for import_name, display_name in deps:
        try:
            module = __import__(import_name)
            version = getattr(module, '__version__', 'installed')
            print(f"   ✓ {display_name} ({version})")
        except ImportError:
            print(f"   ✗ {display_name}")
            all_ok = False
    return all_ok


def check_api_key():
    """Verifica configuración de API key."""
    print("5. Verificando API key...")
    try:
        from alphagenome_helper import load_api_key
        api_key = load_api_key()
        # Mostrar solo los primeros 8 caracteres por seguridad
        masked = api_key[:8] + '...' if len(api_key) > 8 else api_key
        print(f"   ✓ API key configurada: {masked}")
        return True
    except ValueError as e:
        print(f"   ⚠ API key no configurada")
        print(f"     → Obtén tu key en: https://deepmind.google.com/science/alphagenome")
        print(f"     → Configúrala en: .env")
        return False
    except Exception as e:
        print(f"   ⚠ Error verificando API key: {e}")
        return False


def check_client_creation():
    """Intenta crear un cliente (sin hacer llamadas a la API)."""
    print("6. Verificando creación de cliente...")
    try:
        from alphagenome.models import dna_client
        # Solo verificamos que los tipos estén disponibles
        output_types = [o.name for o in dna_client.OutputType]
        print(f"   ✓ Output types disponibles: {len(output_types)}")
        print(f"     {', '.join(output_types[:5])}...")
        return True
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False


def check_helper_module():
    """Verifica el módulo helper."""
    print("7. Verificando alphagenome_helper...")
    try:
        import alphagenome_helper
        functions = ['create_client', 'quick_predict_variant', 'list_output_types', 'list_common_ontologies']
        for func in functions:
            if hasattr(alphagenome_helper, func):
                print(f"   ✓ {func}")
            else:
                print(f"   ✗ {func} no encontrada")
        return True
    except ImportError as e:
        print(f"   ✗ Error importando helper: {e}")
        return False


def run_all_checks():
    """Ejecuta todas las verificaciones."""
    print("=" * 50)
    print("TEST DE INSTALACIÓN DE ALPHAGENOME")
    print("=" * 50)
    print()

    results = []
    results.append(("Python", check_python_version()))
    results.append(("AlphaGenome", check_alphagenome_import()))
    results.append(("Módulos core", check_core_modules()))
    results.append(("Dependencias", check_dependencies()))
    results.append(("API Key", check_api_key()))
    results.append(("Cliente", check_client_creation()))
    results.append(("Helper", check_helper_module()))

    print()
    print("=" * 50)
    print("RESUMEN")
    print("=" * 50)

    passed = sum(1 for _, ok in results if ok)
    total = len(results)

    for name, ok in results:
        status = "✓" if ok else "✗"
        print(f"  {status} {name}")

    print()
    print(f"Resultado: {passed}/{total} verificaciones pasaron")

    if passed == total:
        print()
        print("🎉 ¡AlphaGenome está listo para usar!")
        print()
        print("Ejemplo de uso:")
        print("  python -c \"from alphagenome_helper import help; help()\"")
    elif passed >= total - 1 and not results[4][1]:  # Solo falta API key
        print()
        print("⚠ Solo falta configurar la API key")
        print("  1. Obtén tu key: https://deepmind.google.com/science/alphagenome")
        print("  2. Copia .env.example a .env")
        print("  3. Edita .env con tu API key")
    else:
        print()
        print("❌ Hay problemas que resolver antes de usar AlphaGenome")

    return passed == total


if __name__ == '__main__':
    success = run_all_checks()
    sys.exit(0 if success else 1)
