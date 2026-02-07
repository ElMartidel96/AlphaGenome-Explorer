#!/usr/bin/env python3
"""Generate a professional sales PDF for AlphaGenome Explorer."""

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
WHITE = (255, 255, 255)
LIGHT_GRAY = (200, 210, 220)
MID_GRAY = (140, 155, 170)
SOFT_WHITE = (230, 237, 243)
CARD_BG = (22, 27, 34)
CARD_BORDER = (48, 54, 61)
TABLE_HEADER = (30, 38, 50)
TABLE_ROW_1 = (18, 22, 30)
TABLE_ROW_2 = (24, 30, 40)


class SalesPDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.add_font("Sans", "", SANS)
        self.add_font("Sans", "B", SANS_BOLD)
        self.add_font("Mono", "", MONO)
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(18, 18, 18)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 12, "F")
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
        self.cell(0, 6, "AlphaGenome Explorer — Proyecto Open Source | Powered by Google DeepMind AlphaGenome API", align="C")

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
        self.ln(6)
        self.gradient_bar(self.get_y(), 1)
        self.ln(4)
        self.set_font("Sans", "B", 16)
        self.set_text_color(*color)
        self.multi_cell(0, 8, text)
        self.ln(3)

    def subsection_title(self, text, color=ACCENT_CYAN):
        self.check_page_space(16)
        self.ln(3)
        self.set_font("Sans", "B", 12)
        self.set_text_color(*color)
        self.multi_cell(0, 7, text)
        self.ln(2)

    def body_text(self, text):
        self.set_font("Sans", "", 9.5)
        self.set_text_color(*SOFT_WHITE)
        self.multi_cell(0, 5.5, text)
        self.ln(1.5)

    def italic_text(self, text, color=LIGHT_GRAY):
        self.set_font("Sans", "", 9.5)
        self.set_text_color(*color)
        self.multi_cell(0, 5.5, text)
        self.ln(1.5)

    def bold_text(self, text, color=WHITE):
        self.set_font("Sans", "B", 10)
        self.set_text_color(*color)
        self.multi_cell(0, 5.5, text)
        self.ln(1.5)

    def highlight_text(self, text, color=ACCENT_GREEN):
        self.set_font("Sans", "B", 10.5)
        self.set_text_color(*color)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def _calc_multicell_height(self, w, line_h, text):
        """Calculate height of a multi_cell without rendering."""
        # Estimate lines by computing string widths
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

    def quote_block(self, text):
        self.check_page_space(20)
        x = self.get_x()
        y = self.get_y()
        self.set_fill_color(30, 40, 55)
        self.set_draw_color(*ACCENT_PURPLE)
        self.set_font("Sans", "", 10)
        self.set_text_color(*LIGHT_GRAY)
        # Calculate height
        text_h = self._calc_multicell_height(158, 6, text)
        h = text_h + 8
        # Check if we need a new page
        if y + h > 277:
            self.add_page()
            self.dark_page_bg()
            y = self.get_y()
            x = self.get_x()
        self.set_xy(x, y)
        self.rect(x, y, 174, h, "F")
        self.set_line_width(0.8)
        self.set_draw_color(*ACCENT_PURPLE)
        self.line(x, y, x, y + h)
        self.set_line_width(0.2)
        self.set_xy(x + 8, y + 4)
        self.multi_cell(158, 6, text)
        self.set_y(y + h + 3)

    def bullet_point(self, text, color=ACCENT_CYAN):
        self.check_page_space(12)
        x = self.get_x()
        y = self.get_y()
        self.set_font("Sans", "B", 10)
        self.set_text_color(*color)
        self.cell(6, 5.5, "▸")
        self.set_font("Sans", "", 9.5)
        self.set_text_color(*SOFT_WHITE)
        self.multi_cell(162, 5.5, text)
        self.ln(1)

    def bullet_bold_desc(self, bold_part, desc, bullet_color=ACCENT_CYAN):
        self.check_page_space(18)
        x = self.get_x()
        y = self.get_y()
        self.set_font("Sans", "B", 9.5)
        self.set_text_color(*bullet_color)
        self.cell(6, 5.5, "▸")
        self.set_text_color(*WHITE)
        bw = self.get_string_width(bold_part + " ") + 1
        max_inline = 174 - 6
        if bw > max_inline - 20:
            # Bold part is too long, put description on next line
            self.multi_cell(max_inline, 5.5, bold_part)
            self.set_x(x + 6)
            self.set_font("Sans", "", 9)
            self.set_text_color(*SOFT_WHITE)
            self.multi_cell(max_inline, 5.5, desc)
        else:
            self.cell(bw, 5.5, bold_part + " ")
            self.set_font("Sans", "", 9)
            self.set_text_color(*SOFT_WHITE)
            remaining_w = max_inline - bw
            if self.get_string_width(desc) > remaining_w:
                self.multi_cell(remaining_w, 5.5, desc)
            else:
                self.cell(remaining_w, 5.5, desc)
                self.ln(5.5)
        self.ln(1)

    def tool_card(self, name, description, impact, accent=ACCENT_BLUE):
        self.check_page_space(28)
        x = self.get_x()
        y = self.get_y()

        # Card background
        self.set_fill_color(*CARD_BG)
        self.set_draw_color(*CARD_BORDER)

        # Calculate card height
        self.set_font("Sans", "", 8.5)
        desc_h = self._calc_multicell_height(130, 4.8, description)
        card_h = max(desc_h + 22, 28)

        self.rect(x, y, 174, card_h, "DF")

        # Accent left bar
        self.set_fill_color(*accent)
        self.rect(x, y, 2.5, card_h, "F")

        # Tool name
        self.set_xy(x + 6, y + 3)
        self.set_font("Sans", "B", 10)
        self.set_text_color(*accent)
        self.cell(100, 5, name)

        # Impact badge
        self.set_xy(x + 110, y + 3)
        self.set_font("Sans", "B", 7)
        self.set_fill_color(accent[0], accent[1], accent[2])
        self.set_text_color(*DARK_BG)
        badge_w = self.get_string_width(impact) + 8
        self.cell(badge_w, 5, impact, fill=True, align="C")

        # Description
        self.set_xy(x + 6, y + 11)
        self.set_font("Sans", "", 8.5)
        self.set_text_color(*LIGHT_GRAY)
        self.multi_cell(130, 4.8, description)

        self.set_y(y + card_h + 3)

    def stat_box(self, value, label, color, x, y, w=40, h=22):
        self.set_fill_color(color[0], color[1], color[2])
        # Semi-transparent box effect
        bg_r = int(color[0] * 0.2 + DARK_BG[0] * 0.8)
        bg_g = int(color[1] * 0.2 + DARK_BG[1] * 0.8)
        bg_b = int(color[2] * 0.2 + DARK_BG[2] * 0.8)
        self.set_fill_color(bg_r, bg_g, bg_b)
        self.set_draw_color(*color)
        self.rect(x, y, w, h, "DF")
        self.set_xy(x, y + 2)
        self.set_font("Sans", "B", 14)
        self.set_text_color(*color)
        self.cell(w, 8, value, align="C")
        self.set_xy(x, y + 12)
        self.set_font("Sans", "", 6.5)
        self.set_text_color(*LIGHT_GRAY)
        self.cell(w, 5, label, align="C")

    def check_page_space(self, needed_mm):
        if self.get_y() + needed_mm > 277:
            self.add_page()

    def add_dark_page(self):
        self.add_page()
        self.dark_page_bg()


def build_pdf():
    pdf = SalesPDF()

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    pdf.add_dark_page()

    # Top accent bar
    pdf.gradient_bar(0, 3)

    # Main title area
    pdf.ln(50)
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
    pdf.ln(18)

    # Gradient divider
    pdf.gradient_bar(pdf.get_y(), 1.5)
    pdf.ln(12)

    # Subtitle
    pdf.set_font("Sans", "B", 14)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(0, 8, "El Código que Decodifica el Código de la Vida", align="C")
    pdf.ln(10)

    pdf.set_font("Sans", "", 10)
    pdf.set_text_color(*LIGHT_GRAY)
    pdf.cell(0, 6, "Propuesta de Colaboración y Documento de Visión", align="C")
    pdf.ln(30)

    # Stats row
    y = pdf.get_y()
    pdf.stat_box("23", "Herramientas", ACCENT_BLUE, 18, y)
    pdf.stat_box("11", "Outputs AI", ACCENT_CYAN, 62, y)
    pdf.stat_box("20+", "Tejidos", ACCENT_GREEN, 106, y)
    pdf.stat_box("∞", "Potencial", ACCENT_PURPLE, 150, y)
    pdf.set_y(y + 30)

    # Footer info
    pdf.ln(15)
    pdf.set_font("Sans", "", 9)
    pdf.set_text_color(*MID_GRAY)
    pdf.cell(0, 5, "Powered by Google DeepMind AlphaGenome API", align="C")
    pdf.ln(6)
    pdf.cell(0, 5, "Open Source  |  Next.js 15 + FastAPI + TypeScript + Python 3.12", align="C")
    pdf.ln(6)
    pdf.cell(0, 5, "Febrero 2026", align="C")

    # Bottom bar
    pdf.gradient_bar(294, 3)

    # =========================================================================
    # PAGE 2: THE OPENING
    # =========================================================================
    pdf.add_dark_page()

    pdf.section_title("LA PREGUNTA QUE CAMBIA TODO")

    pdf.quote_block(
        "Imaginen por un momento que alguien les hubiera dicho en 1995: «Existe una red que "
        "conectará a toda la humanidad, transformará el comercio, la educación, la medicina y "
        "la forma en que nos relacionamos.» La mayoría habría sonreído con escepticismo. "
        "Hoy, nadie imagina el mundo sin internet."
    )

    pdf.body_text(
        "Ahora, estamos exactamente en ese mismo punto de inflexión, pero con algo "
        "infinitamente más profundo: el lenguaje con el que está escrita la vida misma."
    )

    pdf.body_text(
        "Google DeepMind, la misma organización que resolvió el plegamiento de proteínas "
        "con AlphaFold — un problema que la ciencia no pudo resolver en 50 años — acaba "
        "de abrir al mundo AlphaGenome: una inteligencia artificial capaz de predecir cómo "
        "cada variante en tu ADN afecta tu biología. Cada tejido. Cada célula. Cada gen."
    )

    pdf.highlight_text(
        "AlphaGenome Explorer es la llave que pone ese poder en las manos de toda la humanidad."
    )

    pdf.body_text(
        "No en las manos de un laboratorio con presupuesto millonario. No en las manos de una "
        "farmacéutica. En las manos de un estudiante de secundaria en Buenos Aires. De un médico "
        "rural en Colombia. De un padre que quiere entender qué herencia genética le deja a sus "
        "hijos. De un investigador que busca la cura que nadie ha encontrado."
    )

    # =========================================================================
    # THE PROBLEM
    # =========================================================================
    pdf.section_title("EL PROBLEMA: 8 MIL MILLONES DE PERSONAS CIEGAS ANTE SU PROPIO CÓDIGO", ACCENT_RED)

    pdf.body_text("Vivimos una paradoja histórica sin precedentes:")

    pdf.bullet_point("El genoma humano fue secuenciado hace más de dos décadas.")
    pdf.bullet_point("Hoy, secuenciar tu ADN cuesta menos que un smartphone.")
    pdf.bullet_point(
        "Servicios como 23andMe y AncestryDNA han puesto datos genéticos en las manos "
        "de más de 40 millones de personas."
    )

    pdf.ln(2)
    pdf.highlight_text(
        "Y sin embargo... la inmensa mayoría no tiene la menor idea de qué significan esos datos.",
        ACCENT_ORANGE
    )

    pdf.body_text(
        "Es como tener un libro escrito en un idioma que nadie te enseñó a leer. Un libro que contiene "
        "las instrucciones de tu cuerpo, tus predisposiciones, tus vulnerabilidades, pero también — "
        "y aquí es donde todo cambia — tus capacidades ocultas, tus potenciales no expresados, "
        "tus superpoderes dormidos."
    )

    pdf.ln(2)
    pdf.subsection_title("La ciencia ha descubierto variantes genéticas asociadas a:", ACCENT_GREEN)

    pdf.bullet_bold_desc("Longevidad excepcional —", "personas que viven más de 100 años con salud.", ACCENT_GREEN)
    pdf.bullet_bold_desc("Memoria superior —", "capacidad de retención 10x por encima del promedio.", ACCENT_GREEN)
    pdf.bullet_bold_desc("Resistencia al dolor —", "variantes que modulan la percepción nociceptiva.", ACCENT_GREEN)
    pdf.bullet_bold_desc("Eficiencia metabólica —", "cuerpos que procesan nutrientes de manera óptima.", ACCENT_GREEN)
    pdf.bullet_bold_desc("Neuroplasticidad aumentada —", "cerebros que se adaptan y aprenden más rápido.", ACCENT_GREEN)

    pdf.ln(2)
    pdf.body_text(
        "Estas variantes ya existen en el genoma humano. Algunas están activas. Muchas están "
        "en recesivo, silenciadas, esperando. La epigenética nos ha demostrado que el ambiente, "
        "la nutrición, el ejercicio y hasta la meditación pueden modificar la expresión de estos genes."
    )

    pdf.highlight_text(
        "La pregunta no es si este potencial existe. La pregunta es: ¿quién va a construir la "
        "herramienta que permita a la humanidad verlo, entenderlo y activarlo?",
        ACCENT_PURPLE
    )

    # =========================================================================
    # THE SOLUTION
    # =========================================================================
    pdf.section_title("LA SOLUCIÓN: ALPHAGENOME EXPLORER")

    pdf.body_text(
        "AlphaGenome Explorer es una plataforma web profesional, de código abierto, que traduce "
        "el poder de la inteligencia artificial de DeepMind en 23 herramientas prácticas que cubren "
        "desde el ciudadano común hasta el investigador de frontera."
    )

    pdf.highlight_text(
        "No es un concepto. No es un PowerPoint. Es software funcionando.",
        ACCENT_GREEN
    )

    pdf.body_text(
        "Con una arquitectura de producción, interfaz bilingüe (español/inglés), modo oscuro, "
        "exportación en 7 formatos, y 23 módulos interactivos ya implementados."
    )

    # =========================================================================
    # LEVEL 1: COMMON CITIZENS
    # =========================================================================
    pdf.section_title("NIVEL 1: PARA CADA PERSONA EN EL PLANETA", ACCENT_BLUE)
    pdf.subsection_title("El autoconocimiento genético como derecho humano", WHITE)

    tools_level1 = [
        ("Mi ADN Personal",
         "Sube tus resultados de 23andMe o Ancestry y la IA de DeepMind te dice qué "
         "significa cada variante en tu genoma. No códigos incomprensibles: respuestas claras.",
         "AUTOCONOCIMIENTO"),
        ("Calculadora de Riesgo Familiar",
         "Modela las probabilidades reales de transmitir condiciones genéticas a tus hijos. "
         "No estimaciones vagas: predicciones basadas en IA.",
         "PLANIFICACIÓN"),
        ("Detector de Superpoderes Genéticos",
         "Identifica en tu genoma las variantes asociadas a longevidad, memoria excepcional, "
         "fuerza muscular, eficiencia metabólica. La genética no es solo riesgo: es potencial.",
         "OPTIMIZACIÓN"),
        ("Compatibilidad de Pareja",
         "Analiza el riesgo combinado de enfermedades hereditarias entre dos personas. "
         "Decisiones reproductivas informadas. Prevención en lugar de reacción.",
         "PREVENCIÓN"),
        ("Mi Dieta Genética",
         "Tu ADN determina cómo procesas lactosa, cafeína, grasas, alcohol, gluten. "
         "Esta herramienta te dice qué alimentos son óptimos para ti.",
         "NUTRICIÓN"),
        ("Ancestros y Migración",
         "Visualiza el viaje de tus genes a través de continentes y milenios. Conexión "
         "con la historia. Comprensión de que todos somos una sola especie.",
         "IDENTIDAD"),
        ("Predictor de Envejecimiento",
         "Mapea los genes que afectan tu tasa de envejecimiento biológico y qué factores "
         "epigenéticos puedes modificar. Anti-aging basado en ciencia real.",
         "LONGEVIDAD"),
    ]

    for name, desc, impact in tools_level1:
        pdf.tool_card(name, desc, impact, ACCENT_BLUE)

    pdf.ln(2)
    pdf.bold_text("Impacto potencial: 40 millones de usuarios de tests genéticos + miles de millones que se sumarán.", ACCENT_CYAN)

    # =========================================================================
    # LEVEL 2: STUDENTS
    # =========================================================================
    pdf.section_title("NIVEL 2: PARA ESTUDIANTES Y EDUCADORES", ACCENT_GREEN)
    pdf.subsection_title("Transformar la enseñanza de la biología para siempre", WHITE)

    tools_level2 = [
        ("Laboratorio Virtual de Genética",
         "Experimenta con mutaciones en un entorno seguro. Modifica un gen, observa qué pasa. "
         "Sin riesgo, sin costo, sin límites. El mismo poder experimental que un lab del MIT.",
         "EDUCACIÓN"),
        ("Simulador de Evolución",
         "Visualiza en tiempo real cómo cambios genéticos afectan fenotipos a lo largo de "
         "generaciones. La evolución se vuelve algo que puedes ver y manipular.",
         "COMPRENSIÓN"),
        ("Diseña un Organismo",
         "Crea organismos hipotéticos modificando genes. Experimenta con combinaciones que "
         "no existen en la naturaleza. El Minecraft de la biología molecular.",
         "CREATIVIDAD"),
        ("Detective de Enfermedades",
         "Casos clínicos gamificados donde el estudiante debe identificar la variante "
         "causante. Medicina convertida en juego. Aprendizaje por descubrimiento.",
         "GAMIFICACIÓN"),
        ("Árbol de la Vida Interactivo",
         "Explora genes compartidos entre humanos, delfines, árboles, bacterias. Comprensión "
         "visceral de que compartimos el 60% de nuestros genes con una banana.",
         "CONEXIÓN"),
        ("CRISPR Simulator",
         "Simula edición genética con CRISPR-Cas9 y observa las consecuencias. Los estudiantes "
         "de hoy tomarán decisiones sobre edición genética mañana.",
         "BIOÉTICA"),
    ]

    for name, desc, impact in tools_level2:
        pdf.tool_card(name, desc, impact, ACCENT_GREEN)

    pdf.ln(2)
    pdf.bold_text("Impacto potencial: 1.500 millones de estudiantes en el mundo merecen entender el lenguaje de la vida.", ACCENT_GREEN)

    # =========================================================================
    # LEVEL 3: RESEARCHERS
    # =========================================================================
    pdf.section_title("NIVEL 3: PARA INVESTIGADORES Y PROFESIONALES", ACCENT_PURPLE)
    pdf.subsection_title("Herramientas que la ciencia necesita y que no existen en ningún otro lugar así", WHITE)

    tools_level3 = [
        ("Análisis Masivo de Variantes",
         "Procesa archivos VCF de miles de pacientes con clasificación automática de impacto "
         "(HIGH/MODERATE/LOW). Lo que antes tomaba semanas, toma minutos.",
         "PRECISIÓN"),
        ("Descubridor de Targets de Drogas",
         "Identifica genes candidatos para nuevos fármacos analizando redes regulatorias y "
         "expresión diferencial. Cada nuevo target puede convertirse en un fármaco que salve vidas.",
         "INNOVACIÓN"),
        ("Comparador de Genomas",
         "Compara genomas entre poblaciones, identifica variantes exclusivas, mide diversidad "
         "genética. La medicina no puede ser universal si ignoramos la diversidad.",
         "DIVERSIDAD"),
        ("Predictor de Splicing Alternativo",
         "Predice todas las isoformas posibles de un gen y cómo cada variante afecta el splicing. "
         "Un solo gen puede producir docenas de proteínas diferentes.",
         "COMPLEJIDAD"),
        ("Mapeador de Redes Regulatorias",
         "Visualiza cómo los genes se regulan entre sí. Redes de activación, represión, "
         "feedback loops. Biología de sistemas hecha accesible.",
         "SISTEMAS"),
    ]

    for name, desc, impact in tools_level3:
        pdf.tool_card(name, desc, impact, ACCENT_PURPLE)

    # =========================================================================
    # LEVEL 4: EVOLUTIONARY AWAKENING
    # =========================================================================
    pdf.section_title("NIVEL 4: PARA EL DESPERTAR EVOLUTIVO", ACCENT_ORANGE)
    pdf.subsection_title("Donde este proyecto trasciende lo técnico y se vuelve histórico", WHITE)

    tools_level4 = [
        ("Corrector de Errores del Código",
         "Identifica los 'bugs' genéticos del envejecimiento: genes que acumulan daño, telómeros "
         "que se acortan, reparación de ADN que falla. La muerte por vejez no es ley de la física. "
         "Es un programa biológico. Y los programas se pueden corregir.",
         "EXTENSIÓN DE VIDA"),
        ("Optimizador de Capacidades",
         "Mapea variantes de alto rendimiento cognitivo, atlético, sensorial. No para discriminar, "
         "sino para que cada ser humano conozca dónde está su ventaja natural.",
         "POTENCIAL HUMANO"),
        ("Conector Mente-Genoma",
         "Explora los genes de neuroplasticidad, neurogénesis, receptores de serotonina/dopamina. "
         "La meditación cambia la expresión genética. El ejercicio activa neuroplasticidad. "
         "Esta herramienta conecta la práctica consciente con la biología.",
         "EVOLUCIÓN CONSCIENTE"),
        ("Biblioteca de Variantes Beneficiosas",
         "Un catálogo abierto de las «mejores prácticas» genéticas de la especie humana. Si una "
         "variante confiere longevidad en una población, toda la humanidad debería saberlo.",
         "CONOCIMIENTO COLECTIVO"),
        ("Simulador de Futuro",
         "Proyecta cambios genéticos a lo largo de generaciones. ¿Qué pasa si una población "
         "adopta cierta dieta? ¿Qué ocurre con la presión selectiva moderna? Planificación "
         "evolutiva consciente.",
         "PLANIFICACIÓN EVOLUTIVA"),
    ]

    for name, desc, impact in tools_level4:
        pdf.tool_card(name, desc, impact, ACCENT_ORANGE)

    # =========================================================================
    # ARCHITECTURE PAGE
    # =========================================================================
    pdf.section_title("LA ARQUITECTURA: ESTO NO ES UN PROTOTIPO", ACCENT_CYAN)

    pdf.bold_text("Para los técnicos: esto es lo que ya existe y funciona.", ACCENT_CYAN)
    pdf.ln(2)

    tech_items = [
        ("Frontend:", "Next.js 15, TypeScript, Tailwind CSS, Tremor, diseño glassmorphism responsive"),
        ("Backend:", "FastAPI (Python 3.12), Pydantic v2, async-first, 9 endpoints de API"),
        ("Infra:", "Docker Compose, Redis cache, rate limiting, health checks, 7 formatos de exportación"),
        ("Seguridad:", "API keys almacenadas exclusivamente en el navegador. Cero datos sensibles en servidor"),
        ("i18n:", "Inglés y español desde el día uno"),
        ("Open Source:", "Cada línea es auditable, mejorable, extendible"),
    ]

    for bold, desc in tech_items:
        pdf.bullet_bold_desc(bold, desc, ACCENT_CYAN)

    pdf.ln(3)

    # Stats boxes
    y = pdf.get_y()
    if y + 30 > 277:
        pdf.add_dark_page()
        y = pdf.get_y()

    pdf.stat_box("1M+", "Predicciones/día", ACCENT_BLUE, 18, y, 52, 24)
    pdf.stat_box("11", "Outputs genómicos", ACCENT_CYAN, 74, y, 52, 24)
    pdf.stat_box("20+", "Tejidos humanos", ACCENT_GREEN, 130, y, 52, 24)
    pdf.set_y(y + 30)

    pdf.body_text(
        "La base de datos de DeepMind que alimenta esto soporta resoluciones desde 16KB hasta "
        "1MB de secuencia, genomas humano (hg38) y ratón (mm10), y más de 20 tejidos y 6 líneas "
        "celulares vía ontologías UBERON/EFO."
    )

    pdf.highlight_text("Esto es producción. Esto es real.")

    # =========================================================================
    # WHY NOW
    # =========================================================================
    pdf.section_title("POR QUÉ AHORA: LA VENTANA EVOLUTIVA", ACCENT_ORANGE)

    pdf.body_text("Hay momentos en la historia donde convergen las condiciones exactas para un salto:")

    convergences = [
        ("La IA ya es suficientemente poderosa.", "AlphaGenome de DeepMind predice efectos de variantes con una precisión que era imposible hace 3 años."),
        ("Los datos ya existen.", "Más de 40 millones de personas ya tienen su genoma secuenciado. En 10 años serán miles de millones."),
        ("La epigenética ha demostrado que la expresión genética es modificable.", "No estamos condenados por nuestro ADN. Podemos influir en qué genes se expresan."),
        ("La interfaz no existe.", "El poder está disponible. La comprensión no. AlphaGenome Explorer es el puente."),
        ("Quien construya este puente primero define cómo la humanidad se relaciona con su propio código.", "Puede ser una corporación que venda tus datos. O puede ser una comunidad abierta."),
    ]

    for i, (bold, desc) in enumerate(convergences):
        pdf.bullet_bold_desc(f"{i+1}. {bold}", desc, ACCENT_ORANGE)

    pdf.ln(3)
    pdf.highlight_text(
        "Esa es la decisión que se toma ahora. No mañana. Ahora.",
        ACCENT_RED
    )

    # =========================================================================
    # CALL TO ACTION
    # =========================================================================
    pdf.section_title("QUÉ NECESITAMOS: EL LLAMADO A LA ACCIÓN", ACCENT_GREEN)

    pdf.bold_text("Este proyecto necesita colaboradores de cada disciplina:")
    pdf.ln(2)

    sectors = [
        ("DESARROLLADORES E INGENIEROS DE SOFTWARE", ACCENT_BLUE,
         [
             "Stack moderno: Next.js 15, FastAPI, TypeScript, Docker, Redis.",
             "Issues abiertos, arquitectura documentada en más de 2.000 líneas, código limpio con type safety.",
             "Cada contribución será usada por personas reales para entender su propia biología.",
         ]),
        ("BIÓLOGOS, GENETISTAS Y MÉDICOS", ACCENT_GREEN,
         [
             "Validación científica: cada herramienta debe ser precisa, responsable y éticamente sólida.",
             "Curación de la Biblioteca de Variantes. Revisión de modelos de predicción de riesgo.",
             "Tu conocimiento aquí no queda en un paper que leen 50 personas. Llega a millones.",
         ]),
        ("DISEÑADORES UX/UI", ACCENT_PURPLE,
         [
             "Traducimos la complejidad más profunda de la naturaleza a interfaces para un adolescente de 15 años.",
             "23 herramientas que necesitan la mejor experiencia de usuario posible.",
             "Glassmorphism, dark mode, responsive — la base existe, el potencial es ilimitado.",
         ]),
        ("EDUCADORES", ACCENT_CYAN,
         [
             "El Laboratorio Virtual, el Simulador de Evolución, CRISPR Simulator necesitan pedagogos.",
             "Imaginen un currículo donde los estudiantes aprenden genética manipulando genes virtuales.",
             "En lugar de memorizar cuadros de Punnett: experimentación directa con IA.",
         ]),
        ("ESPECIALISTAS EN ÉTICA Y BIOÉTICA", ACCENT_ORANGE,
         [
             "Este poder requiere responsabilidad. Necesitamos marcos éticos sólidos.",
             "No construimos esto para crear jerarquías genéticas.",
             "Lo construimos para que cada persona conozca y potencie lo mejor de su biología.",
         ]),
        ("INVERSORES Y ALIADOS ESTRATÉGICOS", ACCENT_GREEN,
         [
             "Tier gratuito para educación, tier premium para instituciones e industria farmacéutica.",
             "Mercado de genómica personalizada: USD $27.8 mil millones, crecimiento del 17% anual.",
             "Posición en la intersección exacta entre IA, genómica y acceso democrático.",
         ]),
        ("COMUNICADORES Y DIVULGADORES", ACCENT_BLUE,
         [
             "La ciencia más poderosa es inútil si nadie la entiende.",
             "Videos, artículos, hilos, podcasts — llevar el mensaje a cada idioma y cada rincón.",
             "Traducir complejidad en comprensión. Esa es la misión.",
         ]),
    ]

    for title, color, bullets in sectors:
        pdf.check_page_space(30)
        pdf.subsection_title(title, color)
        for b in bullets:
            pdf.bullet_point(b, color)
        pdf.ln(2)

    # =========================================================================
    # WHAT'S AT STAKE
    # =========================================================================
    pdf.section_title("LO QUE ESTÁ EN JUEGO", ACCENT_RED)

    pdf.body_text(
        "En este momento, la información genética de la humanidad está fragmentada entre "
        "corporaciones que la monetizan, instituciones académicas que la publican en journals "
        "inaccesibles, y bases de datos que requieren un doctorado para interpretar."
    )

    pdf.bold_text("Mientras tanto:", ACCENT_RED)

    pdf.bullet_point("300 millones de personas viven con enfermedades raras, muchas de origen genético, sin diagnóstico.", ACCENT_RED)
    pdf.bullet_point("Millones de familias transmiten condiciones genéticas sin saberlo.", ACCENT_RED)
    pdf.bullet_point(
        "Miles de millones no saben que llevan variantes que podrían optimizar su salud, su cognición, "
        "su longevidad, si tan solo supieran qué genes activar y cuáles silenciar.", ACCENT_RED
    )

    pdf.ln(2)
    pdf.body_text(
        "AlphaGenome Explorer no resuelve todo esto de la noche a la mañana. Pero construye la "
        "infraestructura para que sea posible. Es el primer paso real, funcional y abierto hacia "
        "una humanidad que se conoce a sí misma a nivel molecular."
    )

    # =========================================================================
    # THE VISION - CLOSING
    # =========================================================================
    pdf.section_title("LA VISIÓN: LO QUE CONSTRUIMOS JUNTOS", ACCENT_PURPLE)

    pdf.body_text("Imaginen un mundo donde:")
    pdf.ln(1)

    visions = [
        "Un niño nace y sus padres reciben un mapa completo de su potencial genético. No para etiquetarlo. Para darle las mejores condiciones para expresar lo mejor de su código.",
        "Un estudiante de medicina en África accede a las mismas herramientas de análisis genómico que un investigador en Harvard. Gratis. En su idioma.",
        "Una pareja que planifica una familia puede ver, con claridad científica, qué riesgos genéticos comparten y qué medidas tomar. Sin miedo. Con conocimiento.",
        "Un adulto de 40 años descubre que tiene variantes de neuroplasticidad excepcional que nunca explotó, y comienza un programa de aprendizaje que transforma su vida.",
        "Un investigador en un país en desarrollo identifica un target farmacológico que las grandes farmacéuticas pasaron por alto.",
        "La humanidad, por primera vez en 300.000 años, mira su propio código fuente con comprensión. Y decide, conscientemente, hacia dónde evolucionar.",
    ]

    for v in visions:
        pdf.quote_block(v)
        pdf.ln(1)

    # =========================================================================
    # FINAL PAGE - CTA
    # =========================================================================
    pdf.add_dark_page()

    pdf.ln(25)
    pdf.gradient_bar(pdf.get_y(), 2)
    pdf.ln(15)

    pdf.set_font("Sans", "B", 13)
    pdf.set_text_color(*SOFT_WHITE)
    pdf.multi_cell(0, 7,
        "Nosotros elegimos construirlo abierto.\n"
        "Elegimos construirlo para todos.\n"
        "Elegimos construirlo ahora.",
        align="C"
    )

    pdf.ln(12)
    pdf.set_font("Sans", "B", 20)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(0, 10, "¿Estás adentro?", align="C")

    pdf.ln(25)
    pdf.gradient_bar(pdf.get_y(), 1)
    pdf.ln(10)

    # Tech summary box
    y = pdf.get_y()
    pdf.set_fill_color(*CARD_BG)
    pdf.set_draw_color(*CARD_BORDER)
    pdf.rect(30, y, 150, 55, "DF")

    pdf.set_xy(30, y + 5)
    pdf.set_font("Mono", "", 9)
    pdf.set_text_color(*ACCENT_CYAN)
    pdf.cell(150, 5, "DATOS DEL PROYECTO", align="C")

    info_lines = [
        ("Stack:", "Next.js 15 | FastAPI | TypeScript | Python 3.12 | Docker"),
        ("Licencia:", "Open Source"),
        ("Estado:", "23 herramientas funcionales, arquitectura producción"),
        ("API:", "Google DeepMind AlphaGenome (gratuita)"),
        ("Idiomas:", "Español | English"),
    ]

    yy = y + 14
    for label, value in info_lines:
        pdf.set_xy(40, yy)
        pdf.set_font("Sans", "B", 8.5)
        pdf.set_text_color(*ACCENT_BLUE)
        pdf.cell(28, 5, label)
        pdf.set_font("Sans", "", 8.5)
        pdf.set_text_color(*LIGHT_GRAY)
        pdf.cell(100, 5, value)
        yy += 7

    pdf.set_y(y + 62)

    pdf.ln(10)
    pdf.set_font("Sans", "B", 11)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 6, "Cada pull request cuenta. Cada revisión científica cuenta.", align="C")
    pdf.ln(7)
    pdf.cell(0, 6, "Cada mente que se suma acelera el momento", align="C")
    pdf.ln(7)
    pdf.cell(0, 6, "en que esta herramienta llegue a quien la necesita.", align="C")

    pdf.ln(20)
    pdf.gradient_bar(pdf.get_y(), 1)
    pdf.ln(8)

    pdf.set_font("Sans", "B", 11)
    pdf.set_text_color(*ACCENT_GREEN)
    pdf.cell(0, 7, "El código de la vida ya fue escrito.", align="C")
    pdf.ln(8)
    pdf.set_font("Sans", "B", 13)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 7, "Es hora de que todos podamos leerlo.", align="C")

    pdf.ln(15)
    pdf.set_font("Sans", "", 8)
    pdf.set_text_color(*MID_GRAY)
    pdf.cell(0, 5, "AlphaGenome Explorer — Decodificando el potencial humano, una variante a la vez.", align="C")

    # Bottom bar
    pdf.gradient_bar(294, 3)

    # Save
    output_path = "/home/user/AlphaGenome-Explorer/AlphaGenome_Explorer_Pitch.pdf"
    pdf.output(output_path)
    return output_path


if __name__ == "__main__":
    path = build_pdf()
    print(f"PDF generado exitosamente: {path}")
