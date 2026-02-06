# Guia Completa para Prueba Piloto - AlphaGenome Explorer

## Fecha: Febrero 2026
## Version: 1.0

---

## PARTE 1: Estructura de Navegacion del Sistema

### Barra de Navegacion Principal (6 Pestanas)

| Tab | Nombre ES | Proposito | Estado | Requiere API? |
|-----|-----------|-----------|--------|---------------|
| 1 | **Analizador de Variantes** | Analisis tecnico usando AlphaGenome API. Acepta rs IDs (ej: rs1234) o posiciones cromosomicas. | Funcional | Si |
| 2 | **Explorador de Regiones** | Navegador de regiones genomicas con predicciones de RNA-seq, ATAC-seq, splicing | Placeholder | Si |
| 3 | **Analisis por Lote** | Subir archivos VCF para analizar multiples variantes a la vez (max 10,000) | Placeholder | Si |
| 4 | **Aprender** | Academia de Genetica - lecciones educativas sobre ADN, variantes, expresion genica | Basico | No |
| 5 | **Mi ADN** | **HERRAMIENTAS PRINCIPALES** - 13 herramientas con datos reales o demo | Completo | Parcial |
| 6 | **Herramientas** | Catalogo visual de todas las herramientas disponibles | Clickeable | No |

### Herramientas Disponibles en "Mi ADN" (13 Total)

| # | Herramienta | Descripcion | Usa Datos Reales? |
|---|-------------|-------------|-------------------|
| 1 | Mi ADN Personal | Subir resultados 23andMe/Ancestry | Si - archivo raw |
| 2 | Superpoderes Geneticos | Descubrir variantes de longevidad, memoria, fuerza | Si + Demo |
| 3 | Dieta Genetica | Que alimentos procesa mejor tu cuerpo | Si + Demo |
| 4 | Simulador CRISPR | Simular edicion genetica y consecuencias | Educativo |
| 5 | Redes Regulatorias | Grafo interactivo de genes y pathways | Educativo |
| 6 | Conector Mente-Genoma | Neuroplasticidad y habitos | Si + Demo |
| 7 | Predictor Envejecimiento | Edad biologica vs cronologica | Si + Demo |
| 8 | Optimizador Capacidades | Rendimiento cognitivo | Si + Demo |
| 9 | Riesgo Familiar | Patrones hereditarios en familia | Educativo + Demo |
| 10 | Explorador Ancestros | Composicion ancestral y migraciones | Si + Demo |
| 11 | Laboratorio Virtual | Experimentos: PCR, electroforesis, etc. | Educativo |
| 12 | Simulador Evolucion | Seleccion natural interactiva | Educativo |
| 13 | Detective Genetico | Resolver casos con evidencia ADN | Gamificado |

---

## PARTE 2: Estudio de Mercado - Tests de ADN para Prueba Piloto

### Comparativa de Servicios de ADN (Actualizado 2026)

#### Opcion 1: 23andMe Health + Ancestry (RECOMENDADO para salud)

**Precio:** ~$199-229 USD (frecuentes descuentos a $99-149)

**Incluye:**
- 150+ reportes geneticos personalizados
- Reportes de salud aprobados por FDA
- Predisposiciones de salud (Alzheimer, Parkinson, cancer mama BRCA)
- Estado de portador (40+ condiciones)
- Rasgos y bienestar
- Ancestria con 4,500+ regiones

**Descarga de Datos Raw:** Si - formato .txt tabulado
- 4 columnas: rsID, cromosoma, posicion, genotipo
- Compatible con AlphaGenome

**Nota 2025-2026:** 23andMe paso por bancarrota en marzo 2025 pero fue vendido y continua operando. Tu cuenta y datos siguen accesibles.

**Link:** https://www.23andme.com/dna-health-ancestry/

---

#### Opcion 2: AncestryDNA (RECOMENDADO para genealogia)

**Precio:** ~$99 USD (frecuentes descuentos a $59-79)

**Incluye:**
- Base de datos MAS GRANDE del mundo (20+ millones)
- Ancestria con regiones detalladas
- Conexion con familiares
- Arbol genealogico con registros historicos

**Descarga de Datos Raw:** Si - formato .txt tabulado
- 5 columnas: rsID, cromosoma, posicion, alelo1, alelo2
- Compatible con AlphaGenome

**Nota:** NO incluye reportes de salud directamente, pero puedes subir a servicios terceros.

**Link:** https://www.ancestry.com/dna/

---

#### Opcion 3: MyHeritage DNA (MEJOR PRECIO)

**Precio:** ~$79 USD (frecuentes descuentos a $39-49)

**Incluye:**
- Ancestria con estimados etnicos
- Coincidencias de ADN
- Arboles genealogicos

**Descarga de Datos Raw:** Si - compatible
**Link:** https://www.myheritage.com/dna

---

#### Opcion 4: Nebula Genomics (DATOS MAS COMPLETOS)

**Precio:** $249-999 USD segun profundidad

**Incluye:**
- Secuenciacion del genoma completo (30x)
- 100% del genoma vs 0.02% de 23andMe/Ancestry
- Reportes actualizados continuamente

**Descarga de Datos Raw:** Si - VCF completo
**Link:** https://nebula.org/

---

### Recomendacion para Tu Prueba Piloto

**MEJOR OPCION CALIDAD-PRECIO:** 23andMe Health + Ancestry

**Razones:**
1. Datos de SALUD incluidos (reportes FDA)
2. Formato raw compatible con AlphaGenome
3. Balance perfecto entre ancestria y salud
4. Descuentos frecuentes (-50%)

**PASOS PARA HACER TU PRUEBA:**

1. **Comprar el kit:**
   - Ve a https://www.23andme.com/dna-health-ancestry/
   - O Amazon: busca "23andMe Health + Ancestry"
   - Precio normal: ~$199, con descuento: ~$99-149

2. **Proceso de muestra:**
   - Recibes kit por correo (7-10 dias)
   - Escupes en tubo (facil)
   - Registras kit online con codigo
   - Envias de vuelta (prepagado)

3. **Tiempo de resultados:** 3-5 semanas

4. **Descargar datos raw:**
   - Ve a Settings > 23andMe Data > Download Raw Data
   - Archivo .txt (aprox 10-20MB)

5. **Usar con AlphaGenome:**
   - Sube el archivo en "Mi ADN Personal"
   - El sistema analiza las ~600,000 variantes

---

## PARTE 3: Servicios Gratuitos para Analisis Adicional

Una vez tengas tus datos raw, puedes subirlos a estos servicios gratuitos:

| Servicio | Que ofrece | Link |
|----------|-----------|------|
| **Genomelink** | Rasgos, ancestria, salud | https://genomelink.io/ |
| **Genetic Genie** | Metilacion, desintoxicacion | https://geneticgenie.org/ |
| **Promethease** | Reportes de salud ($12) | https://promethease.com/ |
| **GEDmatch** | Encontrar familiares | https://www.gedmatch.com/ |
| **DNA Land** | Ancestria y rasgos | https://dna.land/ |

---

## PARTE 4: Conversion de Formatos

Si necesitas convertir tus datos a VCF para otros usos:

**Herramientas de conversion:**
- [2vcf](https://github.com/plantimals/2vcf) - Convierte 23andMe/Ancestry a VCF
- [bcftools convert](https://samtools.github.io/bcftools/howtos/convert.html) - Conversion general

**Comando basico:**
```bash
# Instalar bcftools
brew install bcftools  # macOS
apt install bcftools   # Linux

# Convertir
bcftools convert --tsv2vcf archivo_23andme.txt -f referencia.fa -o output.vcf
```

---

## PARTE 5: Que Cubre vs Que NO Cubre el ADN de Consumidor

### COBERTURA DE DATOS

| Tipo de Test | Cobertura del Genoma | Variantes | Costo |
|--------------|---------------------|-----------|-------|
| 23andMe/Ancestry | ~0.02% | ~600,000 SNPs | $99-199 |
| Exoma Completo | ~1.5% (genes) | ~30 millones | $300-500 |
| Genoma Completo | ~100% | ~3 mil millones | $300-1000 |

### IMPORTANTE ENTENDER:

**Los tests de consumidor (23andMe, Ancestry) cubren:**
- SNPs (polimorfismos de un solo nucleotido) conocidos
- Variantes comunes asociadas a rasgos/salud
- Suficiente para ancestria y rasgos basicos

**NO cubren:**
- Variantes raras
- Mutaciones nuevas (de novo)
- Regiones no codificantes complejas
- Algunos genes importantes

---

## PARTE 6: Checklist para Tu Prueba Piloto

- [ ] Comprar kit 23andMe Health + Ancestry
- [ ] Enviar muestra
- [ ] Esperar resultados (3-5 semanas)
- [ ] Descargar raw data
- [ ] Configurar API key de AlphaGenome
- [ ] Subir datos a "Mi ADN Personal"
- [ ] Probar cada una de las 13 herramientas
- [ ] Documentar bugs/mejoras encontradas
- [ ] Subir a servicios gratuitos adicionales (opcional)

---

## Fuentes

- [23andMe Health + Ancestry](https://www.23andme.com/dna-health-ancestry/)
- [23andMe vs AncestryDNA 2026](https://www.dnaweekly.com/blog/andme-vs-ancestrydna/)
- [Best DNA Upload Sites 2026](https://genomelink.io/blog/best-raw-dna-data-upload-sites)
- [Genetic Genie](https://geneticgenie.org/)
- [2vcf GitHub](https://github.com/plantimals/2vcf)
- [bcftools Conversion](https://samtools.github.io/bcftools/howtos/convert.html)

---

*Documento generado: Febrero 2026*
*Co-Authored-By: Claude <admin@mbxarts.com>*
