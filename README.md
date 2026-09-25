<!-- markdownlint-disable MD033 MD041 -->

<p align="center">
  <img src="assets/icon.svg" alt="Signals and Systems logo" width="120" height="120">
</p>

<h1 align="center">Signals and Systems</h1>

<p align="center">
  <strong>Interactive Lecture Artifact</strong><br>
  <sub>An interactive deck for the undergraduate signals and systems course I have taught to electrical engineering students for many years.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML_%C2%B7_JavaScript-0b1220?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="HTML and JavaScript">
  <img src="https://img.shields.io/badge/KaTeX-0b1220?style=for-the-badge&logo=latex&logoColor=4FBECE" alt="KaTeX">
  <img src="https://img.shields.io/badge/Pyodide-0b1220?style=for-the-badge&logo=python&logoColor=3776AB" alt="Pyodide">
  <img src="https://img.shields.io/badge/NumPy_%C2%B7_SymPy-0b1220?style=for-the-badge&logo=numpy&logoColor=4DABCF" alt="NumPy and SymPy">
  <img src="https://img.shields.io/badge/Playwright-0b1220?style=for-the-badge&logo=playwright&logoColor=45BA4B" alt="Playwright">
  <a href="https://signals-and-systems-tedu.vercel.app"><img src="https://img.shields.io/badge/signals--and--systems--tedu.vercel.app-0b1220?style=for-the-badge&logo=vercel&logoColor=white" alt="Live"></a>
  <a href="https://github.com/huguryildiz/signals-and-systems/actions/workflows/checks.yml"><img src="https://img.shields.io/github/actions/workflow/status/huguryildiz/signals-and-systems/checks.yml?branch=main&style=for-the-badge&label=checks" alt="Checks"></a>
</p>

<h3 align="center">
  <a href="#what-this-is">Overview</a>
  &nbsp;·&nbsp;
  <a href="#topics">Topics</a>
  &nbsp;·&nbsp;
  <a href="#repository-layout">Architecture</a>
  &nbsp;·&nbsp;
  <a href="#building">Building</a>
  &nbsp;·&nbsp;
  <a href="#checks">Checks</a>
</h3>

---

## What this is

The course is taught from a single HTML document that works as both a lecture deck and a study
guide. Each scene reveals one idea at a time, so a derivation can be followed step by step, whether
it is projected in the lecture room or read alone before an exam.

The course runs from what a signal is, through system properties, linear time-invariant systems and
convolution, to Fourier series, the continuous- and discrete-time Fourier transforms, and sampling and
aliasing.

Alongside the scenes, the artifact contains:

- **Laboratories.** Each has controls for a signal or system; moving one updates the plot and the result, such as a classification, a period or a convolution case.
- **Practice questions.** Open-ended questions for each module, each with a worked solution that checks its own answer a second way.
- **Projects to try.** Optional projects at the end of a module, to be done in MATLAB or Python on the student's own computer. Each card gives an aim, what it practises, a few steps and what to look for. They carry no grade and nothing is handed in. Every module from 1 to 7 has four or five.
- **Code pages.** Short Python programs that reproduce a result from the lecture. A reader can run them in the browser from the course site.

The same content also produces a set of printable PDF editions: the lecture notes, a student workbook
with the questions only, and a formula reference.

## Topics

| Module | Title | Topics |
| --- | --- | --- |
| 0 | Why signals and systems? | What a signal is · what a system is · the black box · continuous and discrete time · everyday examples and applications · books · the course map |
| 1 | Signals | Definitions and notation · energy and power · signal operations · periodicity, even and odd · the impulse and the step · complex exponentials · a catalogue of common signals |
| 2 | Systems and their properties | The input–output abstraction · memory, invertibility, causality, stability, time invariance, linearity · classification in practice |
| 3 | Linear time-invariant systems | Impulse response and the representation property · the convolution sum · the convolution integral · properties of convolution · difference and differential equations |
| 4 | Fourier series | The eigenfunction property · synthesis and analysis · series worked out · the discrete-time series · properties · a periodic input through an LTI system |
| 5 | The continuous-time Fourier transform | From series to transform · the standard pairs · periodic signals · properties · convolution and multiplication · systems from a differential equation |
| 6 | The discrete-time Fourier transform | Building the transform · the standard pairs · periodic sequences · properties · convolution and multiplication · duality · difference equations |
| 7 | Sampling and aliasing | The sampler and the sampled spectrum · aliasing and the sampling theorem · reconstruction · aliasing in practice · discrete-time processing · decimation and interpolation |

## How students use it

Students open the course at its site address and work there; the artifact is not handed out as a
download. The PDF editions are available from the same site. Reading progress is kept in the reader's
own browser and is not sent anywhere. The site has no sign-in and no analytics.

The artifact has a student edition and an instructor edition. The published site carries the student
edition only: the site build removes presenter notes, source references and teaching notes from the
file, instead of just hiding them.

Press `?` inside the artifact for the keyboard shortcuts.

## Repository layout

```text
build/     the artifact: sources in build/src/, the build script, and the browser checks
notes/     the lecture notes and the other PDF editions
verify/    Python scripts that recompute every numerical result independently
tools/     text checks on student-facing wording and figure labels
web/       the public site and the script that assembles it
dist/      generated output; never edited by hand
assets/    the course icon
source/    private reference material; not tracked and never redistributed
```

`build/src/` is a set of numbered files concatenated in order. Content is data: scenes, laboratories
and questions are plain JavaScript objects, and one renderer and one plotting module draw them. Figures
are drawn at render time, so they always follow the current light or dark theme.

## Building

Node.js is the only requirement for the artifact and the notes. KaTeX is vendored into the sources, so
nothing is installed and nothing is fetched from the network.

```bash
cd build && node build.js                              # the artifact
cd notes && node build.js                              # the lecture notes
cd notes && node editions.js && node ../build/pw.js topdf.js   # the other editions and all PDFs
node web/build-site.js                                 # the public site, in site/
```

The artifact build is byte-reproducible. If a rebuild from unchanged sources changes the output, that
difference needs to be explained before anything ships.

The numerical checks use a local Python environment:

```bash
/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install numpy sympy
```

## Python on the site

The site is hosted on Vercel as static files. Vercel runs no Python: the code pages run Python in the
reader's browser through [Pyodide](https://pyodide.org), a build of CPython compiled to WebAssembly.

1. On Vercel, the build command `node web/build-site.js` calls `web/pyodide.js`. That script downloads
   Pyodide 0.29.3 from jsDelivr, together with NumPy, Matplotlib and their dependencies, and checks
   every file against a pinned SHA-256. A mismatch stops the build. This is the one step that uses the
   network; the artifact and the notes still build offline.
2. The files are published under `pyodide/v0.29.3/` on the course site itself, so a reader's browser
   never contacts a third-party server. `vercel.json` serves them with a one-year immutable cache and
   the `application/wasm` content type.
3. Nothing is loaded when the page opens. The first press of **Run** loads the runtime and the two
   packages, which takes a few seconds; later runs reuse it.
4. Each program runs in a fresh namespace. Printed output appears under the code, and Matplotlib
   figures are drawn to PNG and shown in place of a window.

The code sent to Python never leaves the reader's browser. A copy of the artifact opened as a local
file (`file://`) makes no request and offers Copy only. For an offline local site build, set
`SKIP_PYODIDE=1`; the site then has no runtime, and Run reports that Python could not be loaded.

## Checks

Before a release, the sources pass a chain of checks. Browser checks render every scene and look for
overflow, damaged mathematics and labels that collide with a drawn curve, and they drive every
laboratory control in both themes. Python scripts recompute every number the course states. Text checks
enforce the wording rules. The browser checks run through `build/pw.js`, which locates the local
Playwright install (set `PW_PATH` if it is elsewhere). Report the result a run actually printed, not a
remembered one.

## Reporting errors

If you find a mistake in a scene, a figure, a question or a PDF, please open an issue on
[GitHub Issues](https://github.com/huguryildiz/signals-and-systems/issues). Say where it is (the scene
title or the page number), what is wrong, and, if it is a display problem, which browser and theme you
used. A screenshot helps.

## Conventions

These are fixed for the whole course and stated in the artifact where a reader first meets them.

- Energy and power are normalised to a 1 Ω resistance.
- The imaginary unit is `j`.
- `X(jω) = ∫ x(t) e^{−jωt} dt` and `x(t) = (1/2π) ∫ X(jω) e^{jωt} dω`.
- `X(e^{jω}) = Σ x[n] e^{−jωn}` and `x[n] = (1/2π) ∫_{2π} X(e^{jω}) e^{jωn} dω`.
- sinc is unnormalised, `sinc(θ) = sin θ / θ`, and this is restated wherever it is used.

## Design

The visual language, the colour roles of signals and the figure rules are in [`DESIGN.md`](DESIGN.md).
The audience, purpose and constraints are in [`PRODUCT.md`](PRODUCT.md). Current work is tracked in
[`TODO.md`](TODO.md).

## Sources

The content is written from the course's own handwritten lecture notes. A standard textbook is used
only to cross-check transform conventions, convergence conditions and scale factors; it is never
quoted, reproduced or redistributed.

## Citing

If you use this material in teaching or research, please cite it. The citation metadata is in
[`CITATION.cff`](CITATION.cff), and GitHub's **Cite this repository** button in the repository sidebar
gives it in APA and BibTeX. In BibTeX:

```bibtex
@misc{yildiz_signals_systems,
  author       = {Y{\i}ld{\i}z, H{\"u}seyin U{\u{g}}ur},
  title        = {Signals and Systems: An Interactive Lecture Artifact},
  year         = {2026},
  version      = {1.8},
  howpublished = {\url{https://signals-and-systems-tedu.vercel.app}},
  note         = {Source: \url{https://github.com/huguryildiz/signals-and-systems}}
}
```

Please cite the version you used. When a new version is released, the version number in
`CITATION.cff` changes with it.

## License

The repository separates original course content from original software.

- **Course content** (scenes, laboratories, questions, worked solutions, lecture notes, figures and the
  authored material in the generated files) is licensed under
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). See `LICENSE-CONTENT`.
- **Software** (the build pipeline, renderer, plotting code, checks, notes pipeline and site build) is
  licensed under the MIT License. See `LICENSE`.
- **Generated HTML files** combine both, plus third-party components, and each part keeps its own
  license.

KaTeX and the shader on the cover page keep their upstream MIT licenses; see `THIRD_PARTY_NOTICES.md`.
Material in `source/` is third-party and is covered by neither project license.

Suggested attribution:

> Hüseyin Uğur Yıldız, *Signals and Systems*, https://huguryildiz.com/
