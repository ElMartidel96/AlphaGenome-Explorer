#!/usr/bin/env python3
"""Generate the definitive AlphaGenome Explorer sales pitch PDF."""

from fpdf import FPDF
import os

# --- Font paths ---
FONT_DIR = "/usr/share/fonts/truetype/dejavu"
SANS = os.path.join(FONT_DIR, "DejaVuSans.ttf")
SANS_BOLD = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")
MONO = os.path.join(FONT_DIR, "DejaVuSansMono.ttf")

# --- Brand colors ---
DARK_BG = (13, 17, 23)
ACCENT_BLUE = (56, 132, 244)
ACCENT_CYAN = (0, 210, 211)
ACCENT_GREEN = (45, 212, 140)
ACCENT_PURPLE = (163, 113, 247)
ACCENT_ORANGE = (240, 165, 60)
ACCENT_RED = (248, 81, 73)
ACCENT_GOLD = (255, 215, 0)
WHITE = (190, 200, 212)
LIGHT_GRAY = (155, 165, 178)
MID_GRAY = (120, 130, 145)
SOFT_WHITE = (175, 185, 198)
CARD_BG = (22, 27, 34)
CARD_BORDER = (48, 54, 61)


class SalesPDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.add_font("Sans", "", SANS)
        self.add_font("Sans", "B", SANS_BOLD)
        self.add_font("Mono", "", MONO)
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(18, 18, 18)

    def header(self):
        # Paint dark background on EVERY page (catches auto page breaks)
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 297, "F")
        if self.page_no() == 1:
            return
        self.set_font("Sans", "B", 7)
        self.set_text_color(*MID_GRAY)
        self.set_xy(18, 3)
        self.cell(0, 5, "ALPHAGENOME EXPLORER  |  Decodificando el Potencial Humano", align="L")
        self.set_xy(0, 3)
        self.cell(192, 5, f"Pág. {self.page_no()}", align="R")
        self.ln(12)

    def footer(self):
        self.set_y(-12)
        self.set_font("Sans", "", 6)
        self.set_text_color(*MID_GRAY)
        self.cell(0, 6, "AlphaGenome Explorer — Open Source | Powered by Google DeepMind AlphaGenome API", align="C")

    def dark_page_bg(self):
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 297, "F")

    def gradient_bar(self, y, h=1.5):
        w = 174
        x = 18
        steps = 80
        sw = w / steps
        for i in range(steps):
            r = int(ACCENT_BLUE[0] + (ACCENT_CYAN[0] - ACCENT_BLUE[0]) * i / steps)
            g = int(ACCENT_BLUE[1] + (ACCENT_CYAN[1] - ACCENT_BLUE[1]) * i / steps)
            b = int(ACCENT_BLUE[2] + (ACCENT_CYAN[2] - ACCENT_BLUE[2]) * i / steps)
            self.set_fill_color(r, g, b)
            self.rect(x + i * sw, y, sw + 0.5, h, "F")

    def section_title(self, text, color=ACCENT_BLUE):
        self.check_page_space(22)
        self.ln(5)
        self.gradient_bar(self.get_y(), 1)
        self.ln(4)
        self.set_font("Sans", "B", 15)
        self.set_text_color(*color)
        self.multi_cell(0, 7.5, text)
        self.ln(2)

    def subsection_title(self, text, color=ACCENT_CYAN):
        self.check_page_space(14)
        self.ln(2)
        self.set_font("Sans", "B", 11)
        self.set_text_color(*color)
        self.multi_cell(0, 6.5, text)
        self.ln(1.5)

    def body_text(self, text):
        self.set_font("Sans", "", 9)
        self.set_text_color(*SOFT_WHITE)
        self.multi_cell(0, 5.2, text)
        self.ln(1.5)

    def bold_text(self, text, color=WHITE):
        self.set_font("Sans", "B", 9.5)
        self.set_text_color(*color)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def highlight_text(self, text, color=ACCENT_GREEN):
        self.set_font("Sans", "B", 10)
        self.set_text_color(*color)
        self.multi_cell(0, 5.8, text)
        self.ln(1)

    def small_text(self, text, color=MID_GRAY):
        self.set_font("Sans", "", 8)
        self.set_text_color(*color)
        self.multi_cell(0, 4.5, text)
        self.ln(1)

    def _calc_multicell_height(self, w, line_h, text):
        words = text.split(" ")
        lines = 1
        current_w = 0
        for word in words:
            ww = self.get_string_width(word + " ")
            if current_w + ww > w and current_w > 0:
                lines += 1
                current_w = ww
            else:
                current_w += ww
        return lines * line_h

    def quote_block(self, text, color=ACCENT_PURPLE):
        self.set_font("Sans", "", 9.5)
        text_h = self._calc_multicell_height(156, 5.5, text)
        h = text_h + 8
        self.check_page_space(h + 4)
        x = self.get_x()
        y = self.get_y()
        self.set_fill_color(30, 40, 55)
        self.rect(x, y, 174, h, "F")
        self.set_line_width(0.8)
        self.set_draw_color(*color)
        self.line(x, y, x, y + h)
        self.set_line_width(0.2)
        self.set_xy(x + 8, y + 4)
        self.set_text_color(*LIGHT_GRAY)
        self.multi_cell(156, 5.5, text)
        self.set_y(y + h + 3)

    def bullet_point(self, text, color=ACCENT_CYAN):
        self.check_page_space(12)
        self.set_font("Sans", "B", 9)
        self.set_text_color(*color)
        self.cell(6, 5, "▸")
        self.set_font("Sans", "", 9)
        self.set_text_color(*SOFT_WHITE)
        self.multi_cell(162, 5, text)
        self.ln(0.8)

    def numbered_item(self, number, title, desc, color=ACCENT_CYAN):
        """Numbered bullet with bold title on one line, description below."""
        self.check_page_space(18)
        x = self.get_x()
        self.set_font("Sans", "B", 9)
        self.set_text_color(*color)
        num_str = f"{number}. "
        self.cell(self.get_string_width(num_str) + 1, 5.2, num_str)
        self.set_text_color(*WHITE)
        self.multi_cell(150, 5.2, title)
        self.set_x(x + 6)
        self.set_font("Sans", "", 8.5)
        self.set_text_color(*SOFT_WHITE)
        self.multi_cell(162, 4.8, desc)
        self.ln(1)

    def tool_card(self, name, description, impact, accent=ACCENT_BLUE):
        self.set_font("Sans", "", 8.2)
        desc_h = self._calc_multicell_height(128, 4.5, description)
        card_h = max(desc_h + 20, 26)
        self.check_page_space(card_h + 4)
        x = self.get_x()
        y = self.get_y()

        self.set_fill_color(*CARD_BG)
        self.set_draw_color(*CARD_BORDER)
        self.rect(x, y, 174, card_h, "DF")

        # Accent left bar
        self.set_fill_color(*accent)
        self.rect(x, y, 2.5, card_h, "F")

        # Tool name
        self.set_xy(x + 6, y + 3)
        self.set_font("Sans", "B", 9.5)
        self.set_text_color(*accent)
        self.cell(98, 5, name)

        # Impact badge
        self.set_font("Sans", "B", 6.5)
        badge_w = self.get_string_width(impact) + 7
        self.set_xy(x + 174 - badge_w - 4, y + 3)
        self.set_fill_color(accent[0], accent[1], accent[2])
        self.set_text_color(*DARK_BG)
        self.cell(badge_w, 4.5, impact, fill=True, align="C")

        # Description
        self.set_xy(x + 6, y + 10)
        self.set_font("Sans", "", 8.2)
        self.set_text_color(*LIGHT_GRAY)
        self.multi_cell(128, 4.5, description)

        self.set_y(y + card_h + 2.5)

    def tool_card_deep(self, name, description, deep_insight, impact, accent=ACCENT_BLUE):
        """Card with description + a deeper insight paragraph."""
        full_text = description
        self.set_font("Sans", "", 8.2)
        desc_h = self._calc_multicell_height(128, 4.5, full_text)
        self.set_font("Sans", "", 7.8)
        deep_h = self._calc_multicell_height(128, 4.2, deep_insight) if deep_insight else 0
        card_h = max(desc_h + deep_h + 24, 28)
        self.check_page_space(card_h + 4)
        x = self.get_x()
        y = self.get_y()

        self.set_fill_color(*CARD_BG)
        self.set_draw_color(*CARD_BORDER)
        self.rect(x, y, 174, card_h, "DF")

        self.set_fill_color(*accent)
        self.rect(x, y, 2.5, card_h, "F")

        self.set_xy(x + 6, y + 3)
        self.set_font("Sans", "B", 9.5)
        self.set_text_color(*accent)
        self.cell(98, 5, name)

        self.set_font("Sans", "B", 6.5)
        badge_w = self.get_string_width(impact) + 7
        self.set_xy(x + 174 - badge_w - 4, y + 3)
        self.set_fill_color(accent[0], accent[1], accent[2])
        self.set_text_color(*DARK_BG)
        self.cell(badge_w, 4.5, impact, fill=True, align="C")

        self.set_xy(x + 6, y + 10)
        self.set_font("Sans", "", 8.2)
        self.set_text_color(*LIGHT_GRAY)
        self.multi_cell(128, 4.5, full_text)

        if deep_insight:
            cy = self.get_y() + 1
            self.set_xy(x + 6, cy)
            self.set_font("Sans", "", 7.8)
            self.set_text_color(*MID_GRAY)
            self.multi_cell(128, 4.2, deep_insight)

        self.set_y(y + card_h + 2.5)

    def stat_box(self, value, label, color, x, y, w=40, h=22):
        bg_r = int(color[0] * 0.2 + DARK_BG[0] * 0.8)
        bg_g = int(color[1] * 0.2 + DARK_BG[1] * 0.8)
        bg_b = int(color[2] * 0.2 + DARK_BG[2] * 0.8)
        self.set_fill_color(bg_r, bg_g, bg_b)
        self.set_draw_color(*color)
        self.rect(x, y, w, h, "DF")
        self.set_xy(x, y + 2)
        self.set_font("Sans", "B", 13)
        self.set_text_color(*color)
        self.cell(w, 7, value, align="C")
        self.set_xy(x, y + 11)
        self.set_font("Sans", "", 6.5)
        self.set_text_color(*LIGHT_GRAY)
        self.cell(w, 5, label, align="C")

    def check_page_space(self, needed_mm):
        if self.get_y() + needed_mm > 277:
            self.add_page()
            self.dark_page_bg()

    def add_dark_page(self):
        self.add_page()
        self.dark_page_bg()


def build_pdf():
    pdf = SalesPDF()

    # =====================================================================
    # COVER PAGE
    # =====================================================================
    pdf.add_dark_page()
    pdf.gradient_bar(0, 3)

    pdf.ln(45)
    pdf.set_font("Sans", "B", 11)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(0, 6, "P R O Y E C T O", align="C")
    pdf.ln(12)

    pdf.set_font("Sans", "B", 36)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 16, "ALPHAGENOME", align="C")
    pdf.ln(14)
    pdf.set_font("Sans", "B", 28)
    pdf.set_text_color(*ACCENT_BLUE)
    pdf.cell(0, 12, "EXPLORER", align="C")
    pdf.ln(16)

    pdf.gradient_bar(pdf.get_y(), 1.5)
    pdf.ln(10)

    pdf.set_font("Sans", "B", 13)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(0, 7, "El Código que Decodifica el Código de la Vida", align="C")
    pdf.ln(8)

    pdf.set_font("Sans", "", 9.5)
    pdf.set_text_color(*LIGHT_GRAY)
    pdf.cell(0, 5, "Propuesta de Colaboración y Documento de Visión", align="C")
    pdf.ln(6)
    pdf.set_font("Sans", "", 8.5)
    pdf.set_text_color(*MID_GRAY)
    pdf.cell(0, 5, "Publicado en Nature, enero 2026 — 3,000+ científicos — 160 países — 1M requests/día", align="C")
    pdf.ln(22)

    # Stats row
    y = pdf.get_y()
    pdf.stat_box("30", "Herramientas", ACCENT_BLUE, 14, y, 36, 22)
    pdf.stat_box("11", "Outputs IA", ACCENT_CYAN, 54, y, 36, 22)
    pdf.stat_box("20+", "Tejidos", ACCENT_GREEN, 94, y, 36, 22)
    pdf.stat_box("1M+", "Req/día", ACCENT_PURPLE, 134, y, 30, 22)
    pdf.stat_box("160", "Países", ACCENT_ORANGE, 168, y, 28, 22)
    pdf.set_y(y + 28)

    pdf.ln(12)
    pdf.set_font("Sans", "", 8.5)
    pdf.set_text_color(*MID_GRAY)
    pdf.cell(0, 5, "Powered by Google DeepMind AlphaGenome API  |  Open Source", align="C")
    pdf.ln(5)
    pdf.cell(0, 5, "Next.js 15 + FastAPI + TypeScript + Python 3.12  |  Febrero 2026", align="C")

    pdf.gradient_bar(294, 3)

    # =====================================================================
    # OPENING: THE LANGUAGE
    # =====================================================================
    pdf.add_dark_page()

    pdf.section_title("EL IDIOMA QUE TE ACOMPAÑA DESDE ANTES DE TU PRIMER RECUERDO")

    pdf.body_text(
        "Hay un idioma que te acompaña desde antes de tu primer recuerdo. No se aprende: "
        "se hereda. Cuatro letras — A, C, G, T. Y con esas cuatro letras se escribió el color "
        "de tus ojos, la forma en que tu cuerpo responde al estrés, la facilidad con la que "
        "aprendes, la manera en que metabolizas una comida, la probabilidad de que una vía "
        "biológica se acelere o se fatigue con los años."
    )

    pdf.body_text(
        "Se escriben cosas tan distintas como tu respuesta a la dopamina, tu tolerancia a la "
        "cafeína, la forma en que tu cuerpo repara daño, la manera en que tus células deciden "
        "\"crezco\" o \"me detengo\", la facilidad con la que un tejido enciende o apaga un gen "
        "en el momento exacto."
    )

    pdf.body_text(
        "Durante años, lo único que podíamos hacer con ese idioma era mirarlo como quien mira "
        "un libro sellado: podíamos contar letras, comparar páginas, buscar patrones... pero "
        "cuando alguien preguntaba \"¿qué significa para mí?\", la respuesta era casi siempre una "
        "estadística. Una probabilidad. Una correlación."
    )

    pdf.highlight_text(
        "Útil, pero insuficiente. Porque el ser humano no cambia con porcentajes: cambia "
        "cuando entiende mecanismos.",
        ACCENT_ORANGE
    )

    pdf.body_text(
        "Una correlación te dice \"esto se relaciona con aquello\", pero no te dice cómo. "
        "Y sin el cómo, la mente humana no entiende: se preocupa, se confunde o lo ignora."
    )

    # =====================================================================
    # THE SHIFT: WHAT ALPHAGENOME IS
    # =====================================================================
    pdf.section_title("EL GIRO: POR PRIMERA VEZ, PODEMOS VER", ACCENT_CYAN)

    pdf.body_text(
        "Ahí es donde sucede el giro real de esta época: por primera vez, un modelo puede "
        "leer tramos larguísimos de ADN de una sola vez — hasta un millón de pares de bases "
        "— y predecir, a resolución de una sola letra, múltiples capas de biología a la vez:"
    )

    layers = [
        "Expresión génica (RNA-seq, CAGE, PRO-cap)",
        "Splicing: sitios donor/acceptor, junctions, isoformas",
        "Accesibilidad de cromatina (DNase-seq, ATAC-seq)",
        "Marcas de histonas y estado epigenético",
        "Unión de factores de transcripción",
        "Mapas de contacto 3D — cómo el ADN se pliega y se toca a distancia para regular genes desde lejos",
    ]
    for layer in layers:
        pdf.bullet_point(layer, ACCENT_CYAN)

    pdf.ln(1)
    pdf.highlight_text(
        "No es una sola foto: es un sistema de cámaras sincronizadas apuntando al mismo "
        "fenómeno. Y cuando tienes todas esas cámaras a la vez, dejas de adivinar: empiezas a ver.",
        ACCENT_GREEN
    )

    pdf.body_text(
        "AlphaGenome de DeepMind es ese modelo. Publicado en Nature en enero 2026, "
        "superó modelos existentes en 25 de 26 evaluaciones de predicción de efectos de variantes. "
        "DeepMind lo hizo open-source, y ya tiene más de 3,000 científicos de 160 países "
        "usando la API, procesando alrededor de 1 millón de requests por día."
    )

    pdf.bold_text("Esto es real. La ciencia es sólida.", ACCENT_CYAN)

    # =====================================================================
    # THE GAP: API vs INTERFACE
    # =====================================================================
    pdf.section_title("POTENCIA SIN TRADUCCIÓN NO TRANSFORMA LA VIDA DE NADIE", ACCENT_ORANGE)

    pdf.body_text(
        "Pero hay una verdad simple: una API cruda puede ser oro para quien programa en "
        "Python... y un muro para el resto del mundo. La diferencia entre una revolución "
        "encerrada y una revolución humana suele ser una sola cosa: interfaz."
    )

    pdf.quote_block(
        "Es como el momento en que Tim Berners-Lee inventó HTTP pero alguien necesitaba "
        "construir Netscape Navigator para que el público pudiera usarlo. AlphaGenome es "
        "HTTP. Este proyecto aspira a ser el navegador.",
        ACCENT_BLUE
    )

    pdf.body_text(
        "AlphaGenome Explorer es esa interfaz. No porque \"resuma\" la ciencia, sino porque la "
        "convierte en algo legible sin romper su rigor. Toma un poder multimodal que normalmente "
        "vive en pipelines bioinformáticos y lo convierte en experiencias: herramientas, simuladores, "
        "laboratorios, mapas, comparadores, bibliotecas, guías."
    )

    pdf.highlight_text(
        "No es una sola función: es un ecosistema de formas de uso. Y cada forma de uso toca "
        "una necesidad humana distinta: identidad, familia, aprendizaje, investigación, "
        "prevención, descubrimiento, futuro."
    )

    pdf.body_text(
        "Imagina la plataforma como un edificio con puertas. No 3. No 5. Treinta. "
        "Y cada puerta abre un tipo de claridad."
    )

    # =====================================================================
    # LEVEL 1: THE INDIVIDUAL
    # =====================================================================
    pdf.section_title("NIVEL 1: EL INDIVIDUO FRENTE A SU PROPIO CÓDIGO", ACCENT_BLUE)

    pdf.tool_card_deep(
        "1. Mi ADN Personal",
        "Toma archivos raw de 23andMe o AncestryDNA y los pasa por AlphaGenome para predecir "
        "el impacto funcional real de cada variante — no solo correlaciones estadísticas de GWAS, "
        "sino cómo cada variante altera la expresión génica, el splicing, la accesibilidad de cromatina.",
        "Imagina a un padre que descubre que la variante rs1800497 en su hijo no solo \"está asociada "
        "con respuesta a dopamina\" sino que AlphaGenome predice exactamente cómo altera la expresión "
        "del receptor DRD2 en tejido cerebral específico. De correlación a mecanismo.",
        "AUTOCONOCIMIENTO", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "2. Calculadora de Riesgo Familiar",
        "Modela transmisión mendeliana y poligénica con predicción funcional real. No es solo un "
        "cuadro de Punnett — combina herencia con predicción de impacto de AlphaGenome.",
        "7,000 enfermedades raras conocidas, 300 millones de personas afectadas. Muchas familias "
        "transmiten condiciones recesivas sin saberlo durante generaciones. Para comunidades con "
        "alta endogamia esto podría ser revolucionario.",
        "PLANIFICACIÓN", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "3. Detector de Superpoderes Genéticos",
        "Reencuadra el genoma como mapa de potencial. Variantes de ACTN3 (velocidad), BDNF "
        "(factor neurotrófico), FOXO3 (longevidad), COMT (resiliencia al estrés) — documentadas, "
        "reales. AlphaGenome predice cómo alteran la expresión en tejidos específicos.",
        "El cambio de paradigma: pasar de \"qué enfermedades podría tener\" a \"qué capacidades tengo "
        "dormidas\". Cada persona lleva variantes que podrían conferir capacidades excepcionales — "
        "sin esta herramienta, nunca lo sabrían.",
        "POTENCIAL", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "4. Compatibilidad de Pareja",
        "Compara genomas de dos personas para identificar riesgo combinado de enfermedades "
        "autosómicas recesivas: fibrosis quística, anemia falciforme, Tay-Sachs.",
        "En Israel, Dor Yeshorim ya hace screening prenupcial y redujo dramáticamente Tay-Sachs. "
        "Esta herramienta democratiza ese enfoque para cualquier pareja, en cualquier lugar, gratis.",
        "PREVENCIÓN", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "5. Mi Dieta Genética",
        "Los genes MCM6/LCT (lactosa), CYP1A2 (cafeína), ADH1B/ALDH2 (alcohol), HLA-DQ2/DQ8 "
        "(gluten), FADS1/FADS2 (ácidos grasos). AlphaGenome predice cómo variantes regulatorias "
        "afectan la expresión de estos genes en tejidos gastrointestinales.",
        "Tu cuerpo es bioquímicamente único — tu dieta debería serlo también. Fin de las dietas "
        "universales que no funcionan para todos.",
        "NUTRICIÓN", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "6. Ancestros y Migración",
        "Rastrea variantes a través de haplogrupos y migraciones humanas. Cada persona como "
        "nodo en una red de 300,000 años de historia. Trazar raíces a través de mezcla ancestral.",
        "Poder trazar raíces genéticas a través de la mezcla taína, española, africana y otras que "
        "componen herencias es un acto de reconexión con ancestros borrados por la historia.",
        "IDENTIDAD", ACCENT_BLUE
    )

    pdf.tool_card_deep(
        "7. Predictor de Envejecimiento",
        "Genes TERT (telomerasa), SIRT1-7 (sirtuinas), FOXO3, APOE, TP53 — directamente "
        "involucrados en las vías del envejecimiento. Conecta variante con mecanismo con "
        "intervención posible.",
        "Ejercicio, ayuno intermitente, meditación, NMN afectan estas vías. No mirar la genética "
        "como lista de amenazas, sino como mapa de potencial: \"qué instrumentos traes\" y "
        "\"cómo se afinan\".",
        "LONGEVIDAD", ACCENT_BLUE
    )

    # =====================================================================
    # LEVEL 2: EDUCATION
    # =====================================================================
    pdf.section_title("NIVEL 2: LA REVOLUCIÓN EDUCATIVA", ACCENT_GREEN)
    pdf.body_text(
        "Cuando la genética se vuelve un laboratorio virtual, deja de ser memorización "
        "y pasa a ser intuición."
    )

    pdf.tool_card_deep(
        "8. Laboratorio Virtual de Genética",
        "Un estudiante de 16 años puede modificar el gen TP53 (supresor de tumores) y ver, "
        "predicho por la IA más avanzada del planeta, cómo esa mutación altera la expresión "
        "génica, el splicing, la accesibilidad de cromatina.",
        "La misma experiencia que un investigador postdoctoral en el Broad Institute — gratis, "
        "en español, desde cualquier lugar del mundo.",
        "EDUCACIÓN", ACCENT_GREEN
    )

    pdf.tool_card_deep(
        "9. Simulador de Evolución",
        "Visualiza cómo cambios genéticos se propagan a través de generaciones bajo diferentes "
        "presiones selectivas. La evolución deja de ser concepto abstracto.",
        "Ver cómo una variante que confiere resistencia a la malaria (gen HBB en anemia falciforme) "
        "se mantiene en una población bajo presión selectiva, con datos reales. Eso es aprendizaje encarnado.",
        "COMPRENSIÓN", ACCENT_GREEN
    )

    pdf.tool_card(
        "10. Diseña un Organismo",
        "Crea organismos hipotéticos modificando genes. El Minecraft de la biología molecular. "
        "Cultiva pensamiento de diseño biológico en la próxima generación.",
        "CREATIVIDAD", ACCENT_GREEN
    )

    pdf.tool_card_deep(
        "11. Detective de Enfermedades",
        "Casos clínicos gamificados. Un estudiante recibe datos genómicos simulados y debe "
        "identificar la variante causante.",
        "Entrenamiento de genetista clínico gamificado — una especialidad donde hay déficit "
        "severo de profesionales globalmente.",
        "GAMIFICACIÓN", ACCENT_GREEN
    )

    pdf.tool_card(
        "12. Árbol de la Vida Interactivo",
        "Explora genes compartidos entre especies. Compartimos ~60% con un plátano, ~98.7% con "
        "un chimpancé. Visualizarlo genera comprensión visceral de la unidad de la vida.",
        "CONEXIÓN", ACCENT_GREEN
    )

    pdf.tool_card_deep(
        "13. CRISPR Simulator",
        "Simula ediciones CRISPR-Cas9 y ve predicciones de AlphaGenome sobre consecuencias "
        "on-target y off-target. Alfabetización bioética de primer nivel.",
        "Los estudiantes de hoy serán los legisladores y médicos que tomarán decisiones sobre "
        "edición genética humana en la próxima década. Necesitan entender antes de tener el poder.",
        "BIOÉTICA", ACCENT_GREEN
    )

    # =====================================================================
    # LEVEL 3: RESEARCH
    # =====================================================================
    pdf.section_title("NIVEL 3: INVESTIGACIÓN Y CLÍNICA", ACCENT_PURPLE)
    pdf.body_text(
        "Aquí el formato cambia: de lo interactivo a lo masivo, de lo narrativo a lo operativo. "
        "La plataforma no promete magia; promete velocidad, estructura y accesibilidad sobre "
        "herramientas que, en bruto, son inaccesibles para demasiada gente."
    )

    pdf.tool_card_deep(
        "14. Análisis Masivo de Variantes",
        "Procesa archivos VCF con clasificación automática HIGH/MODERATE/LOW basada en "
        "predicciones funcionales de AlphaGenome.",
        "Un laboratorio típico maneja 4-5 millones de variantes por genoma. Filtrar las "
        "clínicamente relevantes es un cuello de botella masivo. Esto lo automatiza.",
        "PRECISIÓN", ACCENT_PURPLE
    )

    pdf.tool_card_deep(
        "15. Descubridor de Targets de Drogas",
        "Identifica genes candidatos para fármacos analizando redes regulatorias y expresión "
        "diferencial en tejidos específicos.",
        "Desarrollar un fármaco cuesta ~$2.6 mil millones y toma 10-15 años. Identificar el "
        "target correcto al inicio reduce ambos dramáticamente. Para \"enfermedades olvidadas\" "
        "(Chagas, leishmaniasis, dengue) — esto cambia el juego.",
        "INNOVACIÓN", ACCENT_PURPLE
    )

    pdf.tool_card_deep(
        "16. Comparador de Genomas",
        "Compara variación genética entre poblaciones. Identifica variantes exclusivas.",
        "La medicina genómica tiene sesgo masivo hacia poblaciones europeas. Poblaciones africanas, "
        "asiáticas, indígenas americanas están subrepresentadas. Esta herramienta lo corrige.",
        "DIVERSIDAD", ACCENT_PURPLE
    )

    pdf.tool_card_deep(
        "17. Predictor de Splicing",
        "Un solo gen produce múltiples proteínas vía splicing alternativo. AlphaGenome predice "
        "patrones de splicing, sitios y fuerza de junctions.",
        "Predecir cómo una variante altera el splicing es fundamental para entender muchas "
        "enfermedades genéticas cuyo mecanismo permanece oculto.",
        "COMPLEJIDAD", ACCENT_PURPLE
    )

    pdf.tool_card(
        "18. Mapeador de Redes Regulatorias",
        "Visualiza cómo los genes se regulan entre sí. AlphaGenome predice efectos en factores "
        "de transcripción, cromatina y expresión, permitiendo mapear redes regulatorias completas. "
        "Biología de sistemas hecha accesible.",
        "SISTEMAS", ACCENT_PURPLE
    )

    # =====================================================================
    # LEVEL 4: EVOLUTIONARY FRONTIER
    # =====================================================================
    pdf.section_title("NIVEL 4: LA FRONTERA EVOLUTIVA", ACCENT_ORANGE)
    pdf.body_text(
        "Aquí la ciencia toca filosofía y ética. No con promesas grandilocuentes, sino con "
        "honestidad adulta. Este nivel es filosóficamente audaz y requiere el mayor rigor ético."
    )

    pdf.tool_card_deep(
        "19. Corrector de Errores del Código",
        "Identifica \"bugs\" del envejecimiento: acumulación de daño en ADN, acortamiento de "
        "telómeros, fallo en reparación. El envejecimiento no es ley de la física — es un "
        "programa biológico.",
        "Respaldado por investigación seria: laboratorios de David Sinclair (Harvard), Shinya "
        "Yamanaka, George Church trabajan en reprogramación de envejecimiento. Los factores de "
        "Yamanaka (Oct4, Sox2, Klf4, c-Myc) revierten marcadores epigenéticos. AlphaGenome "
        "predice cómo variantes en estas vías alteran expresión en diferentes tejidos.",
        "EXTENSIÓN DE VIDA", ACCENT_ORANGE
    )

    pdf.tool_card_deep(
        "20. Optimizador de Capacidades",
        "Mapea variantes de alto rendimiento cognitivo, atlético, sensorial. No para discriminar "
        "— para que cada ser humano conozca dónde está su ventaja natural.",
        "La tensión ética es real y se articula honestamente. Hay una línea entre empoderar al "
        "individuo y crear jerarquías. La información es neutral; el contexto determina el impacto. "
        "La herramienta necesita marcos éticos robustos — y eso está bien.",
        "POTENCIAL HUMANO", ACCENT_ORANGE
    )

    pdf.tool_card_deep(
        "21. Conector Mente-Genoma",
        "Genes de neuroplasticidad (BDNF, NTRK2), neurogénesis (DCX), receptores (HTR2A, DRD4, "
        "COMT). Conecta práctica consciente con biología molecular.",
        "Estudios de Kaliman, Benson, Davidson documentan cambios en expresión de genes de "
        "inflamación, telomerasa y estrés con meditación. Esta herramienta personaliza: dado tu "
        "genotipo, estas prácticas impactan estos genes en estos tejidos. No es determinismo "
        "genético — es agencia genómica.",
        "EVOLUCIÓN CONSCIENTE", ACCENT_ORANGE
    )

    pdf.tool_card(
        "22. Biblioteca de Variantes Beneficiosas",
        "Catálogo abierto de las mejores prácticas genéticas de la especie. Si una variante confiere "
        "longevidad en Okinawa, resistencia en una comunidad africana, o capacidad cognitiva "
        "excepcional — toda la humanidad debería tener acceso.",
        "CONOCIMIENTO COLECTIVO", ACCENT_ORANGE
    )

    pdf.tool_card(
        "23. Simulador de Futuro",
        "Proyecta cambios genéticos a lo largo de generaciones bajo diferentes escenarios. ¿Cómo "
        "afectan las tendencias reproductivas actuales al pool genético? Planificación evolutiva consciente.",
        "PLANIFICACIÓN EVOLUTIVA", ACCENT_ORANGE
    )

    # =====================================================================
    # BEYOND THE 23: NEXT HORIZON
    # =====================================================================
    pdf.section_title("MÁS ALLÁ: LAS PRÓXIMAS 7 PUERTAS", ACCENT_GOLD)
    pdf.body_text(
        "La combinación de esta plataforma con AlphaGenome abre puertas que ninguna "
        "herramienta actual ofrece:"
    )

    pdf.tool_card_deep(
        "24. Farmacogenómica Personal",
        "Los genes CYP450 (CYP2D6, CYP2C19, CYP3A4) determinan si un fármaco será efectivo, "
        "inútil o tóxico para ti.",
        "Las reacciones adversas a medicamentos matan ~100,000 personas al año solo en EE.UU. "
        "Predecir la respuesta de tu genoma a un medicamento antes de tomarlo salva vidas literalmente.",
        "SALVAR VIDAS", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "25. Microbioma-Genoma Connector",
        "Los genes HLA y otros modulan qué microbioma intestinal prospera en tu cuerpo.",
        "Conectar tu genotipo con recomendaciones de probióticos y prebióticos específicos. "
        "Nutrición de precisión de siguiente nivel.",
        "SIMBIOSIS", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "26. Reloj Epigenético Personal",
        "Integra datos de metilación de ADN con predicciones de AlphaGenome.",
        "Calcula tu edad biológica versus cronológica y qué intervenciones podrían reducir "
        "la brecha. Tu edad real no es la que dice tu documento.",
        "EDAD REAL", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "27. Companion de Terapia Génica",
        "A medida que terapias génicas llegan al mercado (Luxturna, Zolgensma, Casgevy), "
        "los pacientes necesitan entender qué se está modificando.",
        "El \"traductor\" para pacientes de terapia génica: comprensión clara de la edición "
        "que van a recibir, en lenguaje humano.",
        "COMPRENSIÓN", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "28. Red Global de Variantes Raras",
        "Conectar a personas que comparten variantes ultra-raras.",
        "Si solo 50 personas en el mundo tienen tu variante, encontrar a las otras 49 podría "
        "ser la diferencia entre un diagnóstico y una vida sin respuestas.",
        "CONEXIÓN HUMANA", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "29. Predictor de Respuesta Inmune",
        "Los genes HLA determinan tu respuesta a patógenos y vacunas.",
        "Predecir tu respuesta probable a vacunas específicas basándose en tu genotipo HLA. "
        "Medicina preventiva verdaderamente personalizada.",
        "INMUNOLOGÍA", ACCENT_GOLD
    )

    pdf.tool_card_deep(
        "30. Coach Epigenético Personalizado",
        "Dado tu genotipo, genera un plan de intervenciones epigenéticas: nutrición, ejercicio, "
        "sueño, meditación, compuestos.",
        "Optimizado para silenciar genes de riesgo y activar genes de potencial. La herramienta "
        "que convierte conocimiento genómico en acción diaria concreta.",
        "ACCIÓN DIARIA", ACCENT_GOLD
    )

    # =====================================================================
    # ARCHITECTURE
    # =====================================================================
    pdf.section_title("ESTO NO ES UN PROTOTIPO", ACCENT_CYAN)
    pdf.bold_text("Es software funcionando. Arquitectura de producción.", ACCENT_CYAN)
    pdf.ln(1)

    tech_items = [
        ("Frontend:", "Next.js 15, TypeScript, Tailwind CSS, Tremor, glassmorphism responsive"),
        ("Backend:", "FastAPI (Python 3.12), Pydantic v2, async-first, 9 endpoints API"),
        ("Infra:", "Docker Compose, Redis cache, rate limiting, health checks, 7 formatos export"),
        ("Seguridad:", "API keys solo en el navegador. Cero datos sensibles en servidor"),
        ("i18n:", "Español e inglés desde el día uno"),
        ("Open Source:", "Cada línea auditable, mejorable, extendible"),
    ]
    for bold, desc in tech_items:
        pdf.check_page_space(10)
        pdf.set_font("Sans", "B", 8.5)
        pdf.set_text_color(*ACCENT_CYAN)
        pdf.cell(6, 5, "▸")
        pdf.set_text_color(*WHITE)
        bw = pdf.get_string_width(bold + " ") + 1
        pdf.cell(bw, 5, bold + " ")
        pdf.set_font("Sans", "", 8.5)
        pdf.set_text_color(*SOFT_WHITE)
        pdf.cell(0, 5, desc)
        pdf.ln(6)

    pdf.ln(2)
    y = pdf.get_y()
    if y + 28 > 277:
        pdf.add_dark_page()
        y = pdf.get_y()
    pdf.stat_box("1M+", "Predicciones/día", ACCENT_BLUE, 18, y, 52, 22)
    pdf.stat_box("11", "Outputs IA", ACCENT_CYAN, 74, y, 52, 22)
    pdf.stat_box("20+", "Tejidos humanos", ACCENT_GREEN, 130, y, 52, 22)
    pdf.set_y(y + 28)

    pdf.body_text(
        "Resoluciones desde 16KB hasta 1MB. Genomas humano (hg38) y ratón (mm10). "
        "20+ tejidos y 6 líneas celulares vía ontologías UBERON/EFO. "
        "Publicado en Nature enero 2026 — superando modelos existentes en 25 de 26 evaluaciones."
    )

    # =====================================================================
    # CALL TO ACTION
    # =====================================================================
    pdf.section_title("EL LLAMADO A LA ACCIÓN", ACCENT_GREEN)
    pdf.body_text("Este proyecto necesita mentes de cada disciplina:")
    pdf.ln(1)

    sectors = [
        ("DESARROLLADORES", ACCENT_BLUE,
         "Next.js 15, FastAPI, TypeScript, Docker. Arquitectura documentada en 2,000+ líneas. "
         "Cada contribución será usada por personas reales para entender su biología."),
        ("BIÓLOGOS, GENETISTAS, MÉDICOS", ACCENT_GREEN,
         "Validación científica. Curación de la Biblioteca de Variantes. Revisión de modelos. "
         "Tu conocimiento aquí no queda en un paper que leen 50 — llega a millones."),
        ("DISEÑADORES UX/UI", ACCENT_PURPLE,
         "Traducir la complejidad más profunda de la naturaleza a interfaces que entienda un "
         "adolescente de 15 años. 30 herramientas que necesitan la mejor experiencia posible."),
        ("EDUCADORES", ACCENT_CYAN,
         "Diseñar experiencias pedagógicas para el Laboratorio Virtual, el Simulador de Evolución, "
         "el CRISPR Simulator. Currículos donde se aprende manipulando genes virtuales."),
        ("ESPECIALISTAS EN BIOÉTICA", ACCENT_ORANGE,
         "Marcos éticos para Compatibilidad de Pareja, Optimizador de Capacidades, Simulador de "
         "Futuro. No construimos jerarquías — construimos autoconocimiento con responsabilidad."),
        ("INVERSORES Y ALIADOS", ACCENT_GREEN,
         "Tier gratuito para educación, premium para instituciones. Mercado de genómica personalizada: "
         "USD $27.8 mil millones, crecimiento 17% anual. Intersección exacta de IA + genómica + acceso."),
        ("COMUNICADORES", ACCENT_BLUE,
         "La ciencia más poderosa es inútil si nadie la entiende. Videos, artículos, podcasts. "
         "Llevar este mensaje a cada idioma y cada rincón."),
    ]

    for title, color, desc in sectors:
        pdf.check_page_space(18)
        pdf.set_font("Sans", "B", 9.5)
        pdf.set_text_color(*color)
        pdf.cell(0, 5.5, title)
        pdf.ln(5.5)
        pdf.set_font("Sans", "", 8.5)
        pdf.set_text_color(*SOFT_WHITE)
        pdf.multi_cell(174, 4.8, desc)
        pdf.ln(2.5)

    # =====================================================================
    # THE DEEP VISION
    # =====================================================================
    pdf.section_title("LA VISIÓN PROFUNDA: CADA MENTE, CADA GENOMA, SIENDO UNO", ACCENT_PURPLE)

    pdf.body_text(
        "Lo más potente de este proyecto es el reframe fundamental: tu genoma no es una "
        "sentencia — es un instrumento. Un instrumento que puedes aprender a tocar."
    )

    pdf.body_text(
        "Las variantes que llevas no son defectos ni ventajas fijas — son potencialidades que "
        "se expresan o silencian según cómo vivas, qué comas, cómo pienses, cómo te muevas."
    )

    pdf.highlight_text(
        "La epigenética ha demolido el determinismo genético. AlphaGenome Explorer propone "
        "llevar esa comprensión del laboratorio a cada persona.",
        ACCENT_PURPLE
    )

    pdf.body_text(
        "Cada persona, con su genoma siendo uno con su mente, pudiendo ver cómo sus decisiones "
        "conscientes modifican la expresión de su propio código. No es determinismo genético — "
        "es agencia genómica."
    )

    pdf.ln(1)
    pdf.body_text("Imaginen un mundo donde:")
    pdf.ln(1)

    visions = [
        "Un niño nace y sus padres reciben un mapa de su potencial genético. No para etiquetarlo — "
        "para darle las mejores condiciones para expresar lo mejor de su código.",
        "Un estudiante en cualquier país accede a las mismas herramientas que Harvard. Gratis. En su idioma.",
        "Una pareja ve con claridad científica qué riesgos genéticos comparten. Sin miedo. Con conocimiento.",
        "Un adulto descubre variantes de neuroplasticidad excepcional que nunca explotó, y transforma su vida.",
        "Un investigador en un país en desarrollo identifica un target que las farmacéuticas pasaron por alto.",
        "La humanidad, por primera vez en 300,000 años, mira su código fuente con comprensión. "
        "Y decide, conscientemente, hacia dónde evolucionar.",
    ]
    for v in visions:
        pdf.quote_block(v, ACCENT_PURPLE)
        pdf.ln(0.5)

    # =====================================================================
    # CLOSING PAGE
    # =====================================================================
    pdf.add_dark_page()

    pdf.ln(30)
    pdf.gradient_bar(pdf.get_y(), 2)
    pdf.ln(12)

    pdf.quote_block(
        "Porque el futuro cercano no se va a parecer a una conferencia científica. Se va a "
        "parecer a una pantalla simple donde alguien, por primera vez, dice: \"ah... ahora sí "
        "entiendo\". Y cuando una humanidad empieza a entender su propio idioma, deja de vivir "
        "a ciegas. Empieza, por fin, a elegir con claridad.",
        ACCENT_CYAN
    )

    pdf.ln(8)
    pdf.set_font("Sans", "B", 12)
    pdf.set_text_color(*SOFT_WHITE)
    pdf.multi_cell(0, 7,
        "Nosotros elegimos construirlo abierto.\n"
        "Elegimos construirlo para todos.\n"
        "Elegimos construirlo ahora.",
        align="C"
    )

    pdf.ln(10)
    pdf.set_font("Sans", "B", 20)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(0, 10, "¿Estás adentro?", align="C")

    pdf.ln(18)
    pdf.gradient_bar(pdf.get_y(), 1)
    pdf.ln(8)

    # Tech summary box
    y = pdf.get_y()
    if y + 60 > 277:
        pdf.add_dark_page()
        y = pdf.get_y()
    pdf.set_fill_color(*CARD_BG)
    pdf.set_draw_color(*CARD_BORDER)
    pdf.rect(30, y, 150, 50, "DF")

    pdf.set_xy(30, y + 4)
    pdf.set_font("Mono", "", 8.5)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(150, 5, "DATOS DEL PROYECTO", align="C")

    info_lines = [
        ("Stack:", "Next.js 15 | FastAPI | TypeScript | Python 3.12 | Docker"),
        ("Licencia:", "Open Source"),
        ("Estado:", "30 herramientas, arquitectura producción"),
        ("API:", "Google DeepMind AlphaGenome (gratuita)"),
        ("Publicación:", "Nature, enero 2026"),
        ("Idiomas:", "Español | English"),
    ]
    yy = y + 12
    for label, value in info_lines:
        pdf.set_xy(40, yy)
        pdf.set_font("Sans", "B", 8)
        pdf.set_text_color(*ACCENT_BLUE)
        pdf.cell(25, 5, label)
        pdf.set_font("Sans", "", 8)
        pdf.set_text_color(*LIGHT_GRAY)
        pdf.cell(105, 5, value)
        yy += 6

    pdf.set_y(y + 56)

    pdf.set_font("Sans", "B", 10)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 6, "Cada pull request cuenta. Cada revisión científica cuenta.", align="C")
    pdf.ln(6)
    pdf.cell(0, 6, "Cada mente que se suma acelera el momento", align="C")
    pdf.ln(6)
    pdf.cell(0, 6, "en que esta herramienta llegue a quien la necesita.", align="C")

    pdf.ln(14)
    pdf.gradient_bar(pdf.get_y(), 1)
    pdf.ln(6)

    pdf.set_font("Sans", "B", 10)
    pdf.set_text_color(*ACCENT_GREEN)
    pdf.cell(0, 6, "El código de la vida ya fue escrito.", align="C")
    pdf.ln(7)
    pdf.set_font("Sans", "B", 12)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 6, "Es hora de que todos podamos leerlo.", align="C")

    pdf.ln(10)
    pdf.set_font("Sans", "", 7.5)
    pdf.set_text_color(*MID_GRAY)
    pdf.cell(0, 5, "AlphaGenome Explorer — Decodificando el potencial humano, una variante a la vez.", align="C")

    pdf.gradient_bar(294, 3)

    # Save
    output_path = "/home/user/AlphaGenome-Explorer/AlphaGenome_Explorer_Pitch.pdf"
    pdf.output(output_path)
    return output_path


if __name__ == "__main__":
    path = build_pdf()
    print(f"PDF generado: {path}")
