# escala. — v1.0

Calculadora propia para arquitectura, urbanismo y cartografía. HTML, CSS y JavaScript puro: sin bibliotecas, fuentes remotas, servicios, analítica ni instalación. Funciona abriendo `index.html` y también en GitHub Pages.

## Uso

1. Abre `index.html` en un navegador moderno.
2. Introduce la escala 1:n o elige una escala frecuente.
3. Escribe una medida real o una medida en plano: la otra se recalcula automáticamente. Al cambiar la escala se conserva la última medida que escribiste.
4. Cambia las unidades entre mm, cm, m y km. La distancia física se conserva.
5. En «Encontrar escala», introduce dos medidas de una misma distancia y pulsa «Usar esta escala» para trasladar el resultado al conversor.

Las escalas frecuentes se agrupan en Objetos (1:1, 1:2, 1:5 y 1:10), Arquitectura, Urbanismo y Territorio.

Admite coma o punto decimal, **sin separadores de miles**. Las escalas deben ser positivas; el conversor permite medidas cero y el cálculo de escala requiere ambas medidas mayores que cero. Una escala menor que 1 representa una ampliación. Los resultados visuales se redondean; los cálculos conservan la precisión numérica interna del navegador.

Ejemplos: 25 m a 1:500 son 5 cm en plano; 17 cm en plano y 850 m reales producen 1:5000. El cálculo convierte primero ambas medidas a la misma unidad.

## Archivos

```text
calculadora-escala/
├── index.html
├── css/styles.css
├── js/app.js
└── README.md
```

## Publicar en GitHub Pages

1. Crea un repositorio en tu cuenta de GitHub.
2. Sube **el contenido** de esta carpeta a la raíz del repositorio (index.html debe quedar en la raíz).
3. En Settings → Pages, selecciona Deploy from a branch y la rama que contiene los archivos, carpeta `/ (root)`.
4. Abre la dirección que GitHub muestra cuando termine la publicación.

Las rutas de CSS y JavaScript son relativas para funcionar también bajo `/nombre-del-repositorio/`. No requiere proceso de compilación ni dependencias externas.

## Arquitectura y próximos módulos

`js/app.js` separa el motor matemático de los eventos y la representación visual. `globalThis.Escala.engine` expone `units`, `presets`, `parse`, `convert`, `toPlan`, `toReal` y `findScale`; `Escala.modules.scale` registra el módulo actual. El motor también se exporta con CommonJS para comprobaciones en Node, aunque Node no es necesario para usar la web.

Futuros módulos pueden vivir en archivos independientes (por ejemplo `js/modules/print.js`) y reutilizar este motor. Para registrarlos, evoluciona el registro de módulos explícito y añade sus paneles y controles accesibles. La V1 no incluye lógica de impresión, edificabilidad, densidad o cabida.

Mantén las reglas urbanísticas separadas del motor de escalas; documenta las unidades de superficie, parámetros, ámbito normativo y supuestos de cada módulo.

## Diseño y privacidad

Diseño responsive con controles etiquetados, estados de error, resultados anunciados y navegación de pestañas por teclado. Todo se ejecuta localmente y no guarda ni envía las medidas. Implementación original, inspirada en el concepto de conversión de escalas de https://cristianyarasca.com/calculadora-de-escala/; no utiliza código ni recursos de esa página.
