# Pacote de marca Kanastra (referência)

Coloque aqui o **material oficial** da Kanastra usado como modelo visual do Portal Antecipe:

- PDF / guidelines de marca
- Logos em SVG ou PNG (versões clara, escura, ícone)
- Paleta de cores (hex ou tokens)
- Tipografias licenciadas (arquivos ou links)
- Exports Figma (PNG/SVG), se aplicável

Esta pasta **não é servida** pelo FastAPI — é só documentação e referência para o time e para ajustes de UI.

## O que vai para a aplicação

Copie para produção apenas o necessário:

| Origem (exemplo) | Destino no repo | URL na tela |
|------------------|-----------------|-------------|
| Logo reduzida (símbolo) | `app/static/img/brand/logo-reduzida.svg` | `/static/img/brand/logo-reduzida.svg` (header) |
| Logo principal SVG | `app/static/img/brand/logo-kanastra.svg` | `/static/img/brand/...` |
| Logo / ícone alternativo | `app/static/img/brand/` | idem |
| Fontes web | `app/static/fonts/` | `@font-face` em `main.css` |
| Hero / background | `app/static/img/brand/` ou hero atual | `index.html` |

Hoje o header usa `app/static/img/brand/logo-reduzida.svg` (Kanastra Logo Reduzida — símbolo).

**Windows / macOS:** se um `.svg` copiado do Mac tiver ~6 KB e começar com `Bud1`, é lixo de resource fork — reexporte o SVG ou copie de `app/static/img/brand/logo-reduzida.svg`.

## Arquivos compactados

O `.gitignore` do projeto ignora `*.zip`, `*.rar`, etc. **Descompacte** o pacote nesta pasta antes de commitar, ou versione só PDF/SVG/PNG.

## Tokens sugeridos

Ao aplicar a marca, centralize cores em `app/static/css/main.css` (`:root`) e, se usar build Tailwind, em `tailwind.config.js`.
