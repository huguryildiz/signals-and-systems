# EE311 Premium Interactive Artifact Production Prompt

## Role

You are an expert university-level instructional designer, Signals and Systems lecturer, mathematical editor, scientific visualization specialist, interaction designer, and production-grade frontend engineer.

Use the attached source materials:

- **`EE311 - Lecture Notes.pdf`** - the primary source that defines the course scope, notation, examples, and required coverage;
- **`Book.pdf`** - *Signals and Systems, Second Edition*, by Alan V. Oppenheim, Alan S. Willsky, and S. Hamid Nawab, used only as a secondary verification and explanation source.

Transform the verified course content into:

1. a complete, premium, responsive, interactive set of university lecture notes; and
2. a presentation-quality PDF export generated from the same verified content and visual system.

The interactive lecture-note artifact is the primary deliverable. The PDF is a faithful, non-interactive lecture-note edition for classroom presentation, printing, annotation, and offline distribution.

Do not stop at an outline, design proposal, partial prototype, or sample chapter. Produce the complete learning experience.

---

## 1. Communication objective

By the end of the artifact, undergraduate Electrical and Electronics Engineering students should be able to:

- distinguish continuous-time and discrete-time signals;
- calculate and interpret signal energy and average power;
- perform time shifting, reversal, and scaling correctly;
- determine signal periodicity;
- analyze continuous-time and discrete-time complex exponentials;
- classify systems by memory, causality, stability, invertibility, time invariance, and linearity;
- explain impulse-response representations of LTI systems;
- calculate and visualize continuous-time and discrete-time convolution;
- derive and use CTFS and DTFS representations;
- understand CTFT and DTFT analysis, synthesis, properties, and transform pairs;
- analyze LTI systems in the frequency domain;
- explain sampling, spectral replication, reconstruction, and aliasing;
- connect mathematical results to their physical and engineering interpretation.

Target audience:

- undergraduate Electrical and Electronics Engineering students;
- students with prior exposure to calculus, complex numbers, differential equations, and basic circuit concepts;
- course level: Signals and Systems;
- visible language: simple, direct, and plain academic English;
- mathematical level: rigorous but pedagogically progressive.

### 1.1 Audience-Facing Lecture-Note Rule

Write the visible content as self-contained lecture notes, not as a report about converting or reviewing source files.

This is a hard rule.

The student-facing content must never mention:

- "the PDF";
- "this PDF";
- "the attached file";
- "this file";
- "the source file";
- "the source notes";
- "the lecture-notes PDF";
- "Book.pdf";
- "the textbook file";
- "the uploaded document";
- source-page numbers;
- the conversion, extraction, redrawing, research, or verification process;
- phrases such as "according to the PDF," "as stated in the file," "the document shows," "the source says," or "we converted."

Do not address students as if they are watching a document-conversion process. Present every definition, equation, explanation, graph, example, and question directly as course material.

Use a simple and restrained lecture-note style:

- prefer short, direct sentences;
- explain one idea at a time;
- define a technical term before using it repeatedly;
- use familiar words when they preserve the exact meaning;
- avoid unnecessary jargon, inflated academic phrasing, marketing language, slogans, and conversational filler;
- avoid paragraphs longer than four lines on a learning scene;
- use descriptive headings that name the concept or communicate the mathematical takeaway;
- explain the intuition before or immediately after the formal expression;
- preserve rigorous notation, assumptions, conditions, and qualifications;
- never simplify an explanation by making the mathematics false or incomplete;
- use compact worked examples to make abstract ideas concrete;
- end major note sections with a short "Key idea" or equivalent synthesis when useful.

Preferred note structure:

1. concept or question;
2. plain-language explanation;
3. formal definition or equation;
4. interpretation of the equation;
5. short worked example or visual;
6. common mistake;
7. key takeaway.

Source citations, textbook cross-references, research provenance, ambiguity notes, and verification records belong only in internal metadata, instructor notes, appendices intended for provenance, and separate ledgers. They must not interrupt the ordinary student-facing lecture notes.

---

## 2. Source Authority, Textbook Use, and Controlled Research

Treat the attached 88-page lecture-notes PDF as the primary source of truth for course scope. Use the textbook and external research to verify and clarify that scope, not to replace or silently expand it.

Before authoring:

1. Inspect every page, equation, example, graph, MATLAB result, annotation, and summary table.
2. Build an internal content map linking every concept to its source page.
3. Identify notation conventions, transform definitions, repeated material, derivation dependencies, and ambiguous handwritten expressions.
4. Preserve the source's technical meaning while improving its organization and readability.
5. Do not silently correct an ambiguous or potentially erroneous expression. Record the issue, verify the standard result, and explain any correction in the source ledger.
6. Do not invent numerical values, examples, experimental results, references, or claims and present them as source content.
7. Record supplementary engineering examples or explanations as editorial enhancements in the internal provenance ledger, but do not expose that production label in ordinary student-facing content.

Verified source progression:

- PDF p. 1: cover;
- PDF pp. 2-10: signals, energy and power, signal operations, periodicity, unit impulse and step, sampling and sifting properties, and complex exponentials;
- PDF pp. 11-13: system abstraction and system properties;
- PDF pp. 14-21: LTI systems, impulse response, discrete-time convolution, continuous-time convolution, and LTI properties;
- PDF pp. 22-41: LTI eigenfunctions, continuous-time and discrete-time Fourier series, coefficient derivations, properties, Parseval-type relations, and LTI filtering;
- PDF pp. 42-63: continuous-time Fourier transform, transform derivation, transform pairs, periodic signals, properties, time-frequency relationships, convolution, multiplication, modulation, and differential-equation system analysis;
- PDF pp. 64-79: discrete-time Fourier transform, periodicity, transform pairs, periodic signals, properties, duality, convolution, and difference-equation system analysis;
- PDF pp. 80-88: sampling theorem, impulse-train sampling, spectral replication, reconstruction, zero-order and first-order holds, undersampling, aliasing, anti-aliasing filters, temporal aliasing, and spatial aliasing.

The source labels the sampling section as Chapter 7 and does not contain Chapter 6 in the supplied PDF. Do not invent a missing chapter. Use pedagogical module numbers in the artifact and retain original chapter labels only in source references.

### 2.1 Secondary textbook use

Use **`Book.pdf`** as a secondary academic reference for:

- verifying definitions, assumptions, transform conventions, and convergence conditions;
- checking derivations and scale factors;
- clarifying explanations that are compressed or ambiguous in the lecture notes;
- identifying well-established misconceptions and boundary cases;
- developing original, source-aligned practice questions;
- verifying the relationship among plots, equations, and physical interpretations.

The lecture notes remain authoritative for what belongs in the course artifact. Do not automatically add textbook topics that are absent from the lecture notes. In particular, do not add the textbook's broader Chapter 6 material, communication systems, Laplace transform, z-transform, or other later chapters unless the lecture notes explicitly require the relevant concept.

Copyright and attribution constraints:

- do not reproduce or distribute `Book.pdf` as part of the final deliverables;
- do not copy textbook paragraphs, figures, tables, worked examples, or problem statements verbatim;
- do not trace textbook illustrations when the underlying concept can be explained with an original figure;
- create original explanations, diagrams, plots, examples, and questions;
- cite the textbook bibliographically when it informed a definition, verification, explanation, or exercise;
- record the textbook chapter, section, and printed page used;
- do not expose the local textbook file through the published artifact or its downloadable assets.

### 2.2 Controlled Claude Research

Use Claude Research before implementation and selectively during module production.

Research is permitted for:

- independent mathematical verification;
- standard definitions, theorem conditions, and notation comparisons;
- evidence-based pedagogical sequencing;
- documented student misconceptions;
- engineering applications that clarify source concepts;
- scientific-visualization practices;
- accessibility requirements;
- current browser, rendering, equation-typesetting, plotting, offline-delivery, and PDF-export techniques;
- authoritative implementation documentation for the selected artifact stack.

Research must not:

- override the lecture notes silently;
- expand the curriculum merely because additional material is available;
- introduce advanced topics before their prerequisites;
- use blogs, unattributed summaries, generated content, or search snippets as authority for central mathematical claims;
- inflate the artifact with marginal historical facts, applications, or decorative content;
- copy copyrighted figures, textbook prose, or proprietary question banks.

Use this source priority:

1. `EE311 - Lecture Notes.pdf` for course scope and required content;
2. `Book.pdf` for secondary mathematical verification and clarification;
3. peer-reviewed publications, standards, and authoritative textbooks;
4. official university course materials and open educational resources;
5. official technical documentation for implementation decisions.

Use secondary web sources only when a more authoritative source is unavailable, and label the resulting uncertainty.

Maintain a research ledger containing:

- research question;
- search date;
- complete source title and URL or bibliographic reference;
- source type and authority level;
- specific claim, equation, design decision, or example supported;
- destination module and scene;
- whether the research confirms, clarifies, extends, or conflicts with the lecture notes;
- resolution of every conflict;
- license or reuse status for every external visual asset.

If the lecture notes, textbook, and an authoritative external source disagree, do not choose silently. Record the conflict, determine whether it arises from notation, convention, assumptions, or an error, and state the adopted convention explicitly.

---

## 3. Content transformation rules

Do not reproduce the handwritten PDF as page images.

Instead:

- convert handwritten equations into professionally typeset mathematics;
- redraw signal plots, spectra, block diagrams, convolution constructions, and sampling illustrations;
- reconstruct useful MATLAB plots as clean, consistent scientific visualizations;
- preserve original examples and numerical values when legible and correct;
- break dense source pages into focused learning scenes;
- remove accidental repetition without removing distinct derivation steps;
- explain what each important equation means and why it matters;
- use visual comparisons and counterexamples where they improve understanding;
- keep all central definitions, assumptions, conclusions, and transform conventions.

Each learning scene must have one primary instructional job. Avoid converting one source page into one overloaded screen.

---

## 4. Learning architecture

Create approximately 120-145 main learning scenes, plus concise reference appendices. Adjust the exact count to protect clarity and mathematical completeness.

### Opening: Why Signals and Systems?

- minimal title scene;
- what a signal represents;
- what a system does;
- continuous-time and discrete-time viewpoints;
- relationship between time and frequency domains;
- course concept map;
- module dependencies.

### Module 1: Signal Foundations

- signal definitions and notation;
- continuous-time and discrete-time examples;
- instantaneous power;
- total energy;
- average power;
- energy, power, and neither classifications;
- time shifting;
- time reversal;
- time scaling;
- combined transformations and correct operation order;
- periodicity and fundamental period;
- unit impulse and unit step;
- sampling and sifting properties;
- continuous-time complex exponentials;
- discrete-time complex exponentials;
- periodicity condition for discrete-time sinusoids and exponentials.

### Module 2: Systems and Their Properties

- input-output abstraction;
- memoryless systems and systems with memory;
- invertibility;
- causality;
- BIBO stability;
- time invariance;
- linearity;
- formal tests;
- counterexamples;
- cumulative classification workflow.

### Module 3: Linear Time-Invariant Systems

- significance of LTI systems;
- impulse response;
- representation with shifted impulses;
- discrete-time convolution sum;
- continuous-time convolution integral;
- flip, shift, multiply, and sum or integrate;
- overlap intervals;
- piecewise convolution;
- graphical convolution;
- convolution properties;
- LTI causality, stability, memorylessness, and invertibility.

### Module 4: Fourier Series

- complex exponentials as LTI eigenfunctions;
- frequency response and eigenvalues;
- motivation for Fourier series;
- CTFS analysis and synthesis;
- existence and convergence conditions;
- CTFS coefficient derivations;
- magnitude and phase spectra;
- harmonic interpretation;
- finite-term reconstruction;
- Gibbs phenomenon;
- DTFS analysis and synthesis;
- periodicity of DTFS coefficients;
- CTFS and DTFS properties;
- Parseval-type power relations;
- response of LTI systems to periodic inputs;
- frequency-selective filtering examples.

### Module 5: Continuous-Time Fourier Transform

- transition from Fourier series to Fourier transform;
- periodic-extension limiting argument;
- CTFT analysis and synthesis;
- magnitude and phase;
- rectangular-pulse and sinc relationships;
- normalized versus unnormalized sinc notation;
- time scaling and time-bandwidth relationships;
- Fourier transform of periodic signals;
- CTFT properties;
- Parseval's relation;
- convolution in time and multiplication in frequency;
- multiplication in time and convolution in frequency;
- modulation and spectral translation;
- LTI analysis using \(H(j\omega)\);
- systems characterized by differential equations.

### Module 6: Discrete-Time Fourier Transform

- derivation from DTFS;
- DTFT analysis and synthesis;
- \(2\pi\)-periodicity;
- standard transform pairs;
- finite-duration sequences;
- exponential sequences;
- periodic discrete-time signals;
- DTFT properties;
- duality where supported by the source;
- convolution and multiplication relationships;
- LTI analysis using \(H(e^{j\omega})\);
- systems characterized by difference equations.

### Module 7: Sampling and Aliasing

- continuous-to-discrete conversion;
- impulse-train sampling;
- time-domain and frequency-domain interpretations;
- spectral replication;
- sampling period and frequency;
- Nyquist condition;
- oversampling;
- critical sampling and boundary conditions;
- undersampling;
- aliasing as spectral overlap;
- ideal reconstruction;
- zero-order hold;
- first-order hold;
- band-limited interpolation;
- anti-aliasing filters;
- temporal aliasing;
- spatial aliasing.

### Closing synthesis

- unified signal-system-spectrum-sampling concept map;
- essential equations;
- transform conventions;
- system-property decision workflow;
- convolution checklist;
- common misconceptions;
- integrative exam-style problem;
- guidance on choosing time-domain or frequency-domain analysis.

Do not end with a generic "Thank you" screen.

---

## 5. Instructional pattern

For each major concept, use the following sequence where appropriate:

1. visual intuition;
2. formal definition;
3. central equation;
4. stepwise derivation;
5. worked example;
6. engineering interpretation;
7. common error or counterexample;
8. quick knowledge check;
9. module synthesis.

For worked examples use:

- Given
- Find
- Method
- Solution
- Interpretation
- Sanity check

Break long derivations into several reveal states. Show one meaningful mathematical transition per state and identify the operation used.

Visible content must read as direct, self-contained lecture notes for students. Keep source-file language, production instructions, verification notes, provenance labels, and presenter guidance outside the visible learning canvas.

---

## 6. Required interactive laboratories

Interactions must change equations, plots, data, or explanatory states. Decorative motion does not count.

### A. Signal Transformation Laboratory

Controls:

- shift;
- reversal;
- time scaling;
- combined \(x(at-b)\);
- continuous-time or discrete-time mode.

Show the original and transformed signals together. Update critical points, support intervals, and transformation order.

### B. Energy and Power Classifier

Let students classify source-grounded signals as:

- energy;
- power;
- neither.

Then reveal the integral or summation, limiting argument, convergence result, and final conclusion.

### C. Periodicity Explorer

Allow adjustment of angular frequency and phase. Show:

- continuous-time fundamental period;
- discrete-time periodicity or aperiodicity;
- the rationality condition for discrete-time frequency;
- visual comparison of periodic and aperiodic sequences.

### D. System Property Checker

For selected systems, provide formal checks for:

- memorylessness;
- causality;
- stability;
- time invariance;
- linearity;
- invertibility.

Reveal the criterion, substitution or counterexample, and conclusion.

### E. Graphical Convolution Explorer

Include continuous-time and discrete-time examples. Support:

- flip;
- shift;
- multiply;
- overlap highlighting;
- sum or integration;
- slider for \(n\) or \(t\);
- current output value;
- piecewise output construction.

### F. Fourier-Series Reconstruction Studio

Provide a harmonic-count control and show:

- original periodic signal;
- truncated reconstruction;
- coefficient magnitude;
- coefficient phase;
- reconstruction error;
- Gibbs behavior near discontinuities.

### G. LTI Frequency-Response Demonstrator

Show:

- input spectral components;
- \(H(j\omega)\) or \(H(e^{j\omega})\);
- output spectral components;
- reconstructed output.

### H. CTFT Time-Frequency Explorer

Allow adjustment of pulse width. Update:

- time-domain pulse;
- sinc-shaped spectrum;
- zero crossings;
- main-lobe width;
- time-frequency scaling.

Include a modulation state demonstrating spectral translation by a cosine.

### I. DTFT Periodicity Explorer

Display a sequence and its DTFT over more than one \(2\pi\) interval. Demonstrate:

- spectral repetition;
- magnitude and phase;
- the effect of time shifting.

### J. Sampling and Aliasing Studio

Controls:

- highest signal frequency;
- sampling frequency;
- sampling phase where relevant;
- reconstruction cutoff;
- reconstruction method.

Show:

- continuous-time signal;
- sample points;
- impulse-train representation;
- spectral replicas;
- overlap;
- reconstructed signal;
- aliased frequency.

Include presets for oversampling, boundary sampling, undersampling, zero-order hold, first-order hold, and ideal band-limited reconstruction.

Distinguish spectral replication from aliasing. Replicas appear whenever sampling occurs; aliasing occurs when spectral components overlap or become indistinguishable.

---

## 7. Mathematical requirements

Use consistent notation:

- \(x(t)\): continuous-time input;
- \(x[n]\): discrete-time input;
- \(y(t)\), \(y[n]\): outputs;
- \(h(t)\), \(h[n]\): impulse responses;
- \(\delta(t)\), \(\delta[n]\): impulses;
- \(u(t)\), \(u[n]\): unit-step functions;
- \(a_k\): Fourier-series coefficients;
- \(T_0\), \(N_0\): fundamental periods;
- \(\omega_0\): fundamental angular frequency;
- \(X(j\omega)\): CTFT;
- \(X(e^{j\omega})\): DTFT;
- \(H(j\omega)\), \(H(e^{j\omega})\): frequency responses.

Unless source verification identifies an inconsistency, use:

\[
X(j\omega)=\int_{-\infty}^{\infty}x(t)e^{-j\omega t}\,dt
\]

\[
x(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}X(j\omega)e^{j\omega t}\,d\omega
\]

\[
X(e^{j\omega})=\sum_{n=-\infty}^{\infty}x[n]e^{-j\omega n}
\]

\[
x[n]=\frac{1}{2\pi}\int_{\text{any }2\pi\text{ interval}}
X(e^{j\omega})e^{j\omega n}\,d\omega
\]

For every important equation:

- define symbols on first use;
- identify continuous-time or discrete-time context;
- preserve signs, coefficients, limits, and scale factors;
- state assumptions and convergence conditions;
- distinguish necessary and sufficient conditions;
- distinguish functions from distributions;
- use correct impulse locations and weights;
- distinguish angular frequency from frequency in hertz;
- define the sinc convention explicitly.

---

## 8. Visual system

Create a premium scientific-editorial experience, not a corporate presentation, dashboard, or card-heavy interface.

### 8.1 Reference design direction

Use the following Claude Design project as a directional visual reference:

**`https://claude.ai/design/p/69c17032-a5ac-414d-95c5-347a30b01738?file=fable5-final-hours-playbook.dc.html`**

Study the reference before designing. Extract its underlying design principles rather than copying its content, illustrations, icons, wording, or exact composition.

Carry forward these qualities:

- a warm ivory or parchment-like canvas;
- restrained coral, terracotta, graphite, and slate-blue accents;
- a strong editorial serif display title;
- an italic thesis or interpretive statement beneath major titles;
- small uppercase or monospaced eyebrow labels for module numbers and technical categories;
- generous negative space and carefully balanced vertical gaps;
- thin borders, subtle corner radii, and restrained surface treatment;
- fine dotted or hairline connectors;
- a clear central focal point surrounded by a small number of supporting ideas;
- calm visual pacing, precise alignment, and a handcrafted editorial character;
- a reflective synthesis question or takeaway at the end of major sections.

Translate this language into an original EE311 identity:

- replace the reference's butterfly and Fable imagery with original Signals and Systems motifs;
- use waveforms, impulses, phasors, spectra, convolution overlaps, sampling trains, or time-frequency transformations as focal imagery;
- make the central motif mathematically meaningful rather than decorative;
- use radial or orbital composition only for course maps, module overviews, synthesis scenes, and relationship diagrams;
- do not repeat the same radial card composition across ordinary concept, derivation, example, or quiz scenes;
- retain the reference's warmth and editorial refinement while increasing the precision required for engineering graphics.

Possible hierarchy for selected overview or synthesis scenes:

1. small icon and eyebrow label;
2. large editorial serif title;
3. short italic thesis;
4. central scientific motif;
5. three to five supporting concepts connected with fine lines;
6. closing reflection question or engineering implication.

The reference is inspiration, not a template. The final artifact must be recognizably original and specific to EE311.

### 8.2 Core visual tokens

Use:

- responsive 16:9 learning scenes;
- 1920 x 1080 design basis;
- warm ivory or off-white primary canvas;
- near-black, graphite, or ink-colored body text;
- restrained coral or terracotta for major editorial emphasis;
- slate blue for eyebrow labels, metadata, and structural annotations;
- deep navy used sparingly for selected section dividers and high-contrast technical scenes;
- harmonized cyan for input or continuous-time signals;
- harmonized amber for impulse response or system behavior;
- muted green for outputs;
- muted violet for intermediate transformations;
- muted red for errors, misconceptions, and aliasing;
- subtle engineering-grid texture only where it improves mathematical context.

Typography:

- an editorial serif for major titles, module statements, and selected synthesis scenes;
- a modern, highly legible sans-serif for explanations and interface text;
- a restrained monospaced or technical sans-serif for eyebrow labels, identifiers, and compact metadata;
- a professional mathematical typeface for equations;
- large classroom-readable titles and equations;
- no body text smaller than 16 pt equivalent in the PDF.

Avoid:

- generic stock photographs;
- excessive cards, pills, tabs, badges, and UI chrome;
- decorative gradients and glowing effects;
- visual clutter;
- low-resolution handwritten screenshots;
- repeated use of the same decorative image.

### 8.3 Premium Quality Acceptance Criteria

The term "premium" must be demonstrated through execution, not merely stated.

Every module must satisfy the following criteria:

- no default Canva, PowerPoint, generic AI, documentation-site, or component-library appearance;
- no unresolved placeholder text, generic icons, temporary diagrams, or draft imagery;
- a coherent grid, spacing scale, type scale, color system, border treatment, and alignment logic;
- optical as well as mathematical alignment of titles, equations, axes, cards, and diagrams;
- balanced top, bottom, and side spacing at full-screen size;
- deliberate visual hierarchy that can be understood within a few seconds;
- varied scene silhouettes chosen for the content while preserving one recognizable design system;
- bespoke scientific graphics and original visual metaphors where they materially improve comprehension;
- equations treated as first-class visual elements rather than inserted as dense text blocks;
- controlled information density, with content shortened or split before typography is reduced;
- interactions that feel responsive, calm, and purposeful;
- transitions and micro-interactions that clarify state changes, sequence, causality, or mathematical transformation;
- no bouncing, gratuitous parallax, continuous decorative motion, or effects that compete with equations;
- visually consistent loading, empty, error, disabled, selected, correct-answer, and incorrect-answer states;
- high-quality crops and resolution for every raster asset that remains necessary;
- no visible AI-generation artifacts, malformed symbols, inconsistent illustration styles, or illegible labels.

Premium review must include:

- full-screen desktop inspection;
- classroom-projector inspection;
- tablet inspection;
- print and PDF inspection;
- light and dark high-contrast scene inspection where both are used;
- reduced-motion inspection;
- comparison of adjacent scenes to detect repetitive layouts or abrupt visual-system changes;
- a final art-direction pass performed separately from mathematical QA.

If a scene resembles a default slide template, generic dashboard, or unedited AI-generated interface, redesign it before delivery.

---

## 9. Redrawing equations and visuals

The original handwritten equations, graphs, spectra, block diagrams, and MATLAB figures may and should be redrawn.

Requirements:

- use typeset LaTeX-quality equations;
- use editable or resolution-independent vector graphics wherever possible;
- retain searchable and selectable text;
- label all axes and important points;
- preserve correct support intervals;
- distinguish continuous-time curves from discrete-time stems;
- render impulses as arrows with visible weights;
- preserve negative-frequency components;
- pair magnitude and phase plots when phase is meaningful;
- use consistent scaling when comparing signals;
- highlight only the true convolution overlap region;
- mark sampling-replica centers and bandwidths;
- avoid rasterizing whole learning scenes.

Recreate scientific figures from their mathematical definitions. Do not trace low-quality screenshots if the underlying equation is available.

---

## 10. Artifact experience

Implement the primary artifact as a responsive, production-quality interactive presentation or learning application.

It must include:

- keyboard navigation;
- previous, next, home, and module-map controls;
- restrained progress indicator;
- lecture mode;
- self-study mode;
- progressive derivation reveals;
- clickable hints and solution reveals;
- module quizzes;
- formula glossary;
- concept-review links;
- accessible focus states;
- reduced-motion mode;
- responsive desktop and tablet layouts.

Use reusable components for plots, equations, quizzes, reveal sequences, navigation, and interactive laboratories. Keep verified course content separate from presentation logic.

Do not create static controls that look functional but do nothing.

---

## 11. PDF fallback

Export a presentation-quality PDF from the same verified content and visual system.

The PDF must:

- use a landscape 16:9 page format;
- preserve vector equations and scientific plots;
- retain searchable text;
- include PDF bookmarks;
- include a clickable table of contents;
- include working internal chapter, home, review, question, and solution links;
- simulate progressive reveals through successive pages;
- convert interactive exercises into question, hint, and solution page sequences;
- remain readable in full-screen presentation mode;
- remain suitable for printing and annotation;
- contain no clipped, overlapping, blurry, or missing content;
- avoid dependence on PDF JavaScript, embedded sliders, or viewer-specific features.

Do not describe the PDF as having live sliders or simulations. It is a navigable, carefully sequenced representation of the interactive artifact.

---

## 12. Chapter-Level Question Banks and Solutions

At the end of every pedagogical module, create a question bank containing 10-15 original, source-aligned questions. Use 12 questions by default:

- 3 conceptual multiple-choice questions;
- 3 short calculation problems;
- 2 misconception-diagnostic questions;
- 2 multi-step exam-style problems;
- 1 graph, signal, or spectrum interpretation problem;
- 1 synthesis or engineering-application problem.

Questions must:

- cover the module's essential learning outcomes;
- progress from foundational to challenging;
- use technically plausible distractors;
- avoid trivial substitutions and wording cues;
- remain solvable using concepts established in the source notes;
- use new numerical values or signal definitions where useful while preserving the source's notation and mathematical conventions;
- be clearly labeled as editorially developed questions rather than questions copied from the source PDF;
- avoid testing material that has not yet been introduced;
- state all assumptions, parameters, domains, and required outputs unambiguously.

Provide a complete solution for every question. Each solution must include:

1. the governing definition, theorem, or property;
2. the chosen method;
3. all essential intermediate steps;
4. the final answer with correct notation and units;
5. a brief interpretation;
6. a sanity check or alternative verification where applicable;
7. the most likely student error and why it is incorrect.

For multiple-choice questions, explain why every incorrect option is wrong.

Ensure that the question banks diagnose misconceptions including:

- confusing energy with power;
- applying time shifting and scaling in the wrong order;
- assuming every discrete-time sinusoid is periodic;
- classifying systems without formal tests;
- forgetting the flip step in convolution;
- confusing Fourier-series coefficients with a Fourier transform;
- omitting negative-frequency components;
- forgetting DTFT periodicity;
- confusing spectral replication with aliasing;
- treating the Nyquist boundary as automatically safe;
- confusing a hold circuit with ideal reconstruction.

In the interactive artifact:

- present each question before its answer or solution;
- provide optional, progressively specific hints;
- accept answers and return immediate diagnostic feedback;
- allow students to retry without revealing the full solution automatically;
- keep complete solutions hidden until explicitly requested;
- report performance by concept without collecting personal data.

In the PDF deliverables:

- include two or three representative knowledge checks in the main lecture PDF;
- place the complete 10-15-question bank for every module in a separate student workbook PDF;
- place all complete solutions in a separate instructor solutions PDF;
- provide stable question identifiers shared by the artifact, workbook, and solutions;
- provide internal links from each workbook question to the corresponding solution when the files are used together, and provide return links from solutions to questions;
- ensure that solutions are not visible on the same page as the questions;
- include a concise final-answer key before the detailed solutions;
- do not overload the main lecture PDF with the complete question bank.

Before delivery, independently verify every question and solution for mathematical correctness, notation consistency, unambiguous wording, and agreement among equations, plots, answer choices, and final answers.

---

## 13. Production, Verification, and Distribution Requirements

### 13.1 Separate deliverables by instructional purpose

Do not force all content into one oversized PDF. Produce:

- the primary interactive learning artifact;
- a main lecture PDF containing the core instructional sequence and representative knowledge checks;
- a student workbook PDF containing the complete module-level question banks without visible detailed solutions;
- an instructor solutions PDF containing complete verified solutions and teaching notes;
- a concise formula, notation, and transform-pair reference PDF.

All deliverables must use the same notation, question identifiers, source references, visual language, and version number.

### 13.2 Phased production and acceptance gates

Use the following production phases:

1. source audit and page-level content inventory;
2. controlled Claude Research and evidence acquisition;
3. textbook cross-check and notation comparison;
4. notation, transform-convention, and ambiguity ledger;
5. learning architecture and source-coverage matrix;
6. module-by-module content and interaction production;
7. module-level mathematical and pedagogical verification;
8. full artifact integration;
9. PDF and workbook generation;
10. cross-deliverable consistency testing;
11. final visual, functional, and accessibility quality assurance.

Do not treat an outline, visual mockup, or partially implemented module as a completed phase.

Before moving past each module-level gate, confirm:

- all mapped source concepts are covered or explicitly excluded with justification;
- equations and examples are verified;
- interactive controls produce mathematically correct states;
- questions and solutions have passed independent checks;
- the module contains no unresolved placeholders;
- accessibility and layout checks pass.

### 13.3 Independent computational verification

Where mathematically applicable, verify results independently using symbolic, numerical, or programmatic checks.

Verification must cover:

- energy and average-power calculations;
- periodicity conditions and fundamental periods;
- system-property examples and counterexamples;
- convolution sums, integrals, supports, and piecewise boundaries;
- CTFS and DTFS coefficients;
- Fourier-transform pairs and scale factors;
- magnitude and phase plots;
- Parseval-type relations;
- modulation and spectral shifts;
- LTI frequency responses;
- differential-equation and difference-equation examples;
- sampling frequencies, replica positions, bandwidths, reconstructed signals, and aliased frequencies;
- every generated question, answer choice, and final solution.

Test interactive laboratories at nominal values, boundary conditions, and representative edge cases. A visually plausible plot is not sufficient evidence of mathematical correctness.

### 13.4 Source-coverage matrix

Maintain a complete coverage matrix for all 88 source pages.

For each source page record:

- concepts and examples present;
- destination artifact scenes;
- destination PDF pages or appendix entries;
- associated questions or laboratories;
- equations or figures that were redrawn;
- textbook sections used for verification;
- external research sources used for verification or enhancement;
- ambiguities or suspected source errors;
- whether the material was included, merged, moved, or intentionally excluded;
- justification for every intentional exclusion.

No source page may remain unmapped.

### 13.5 Search and cross-references

The artifact must provide:

- full-text search over concepts, symbols, equations, and question identifiers;
- a searchable notation and formula glossary;
- direct links from symbols to their definitions;
- links from transform properties to their derivations and worked examples;
- links from quiz feedback to the relevant concept review;
- links between related time-domain and frequency-domain representations;
- stable deep links to modules, scenes, laboratories, questions, and solutions.

PDF deliverables must reproduce the most important cross-references using bookmarks, internal hyperlinks, and consistent identifiers.

### 13.6 Offline use, performance, and privacy

The interactive artifact must:

- remain usable offline after installation or initial packaging;
- avoid runtime dependence on third-party services for core course content;
- load modules and high-cost visualizations only when needed;
- remain responsive on typical laptops and tablets;
- provide reduced-motion and low-performance modes;
- preserve readable static fallbacks when an animation or interactive plot is disabled;
- store optional progress only on the local device;
- provide reset and resume controls;
- collect no personal data, analytics, or browsing history by default;
- transmit no student responses unless a separate, explicit integration is requested and approved.

Define measurable performance targets and test them on representative desktop and tablet viewports.

### 13.7 Student and instructor editions

Provide two clearly separated modes or builds:

#### Student edition

- complete lessons and laboratories;
- questions shown before answers;
- progressively specific hints;
- full solutions hidden until requested;
- no instructor-only commentary;
- local, privacy-preserving progress tracking.

#### Instructor edition

- complete solutions immediately accessible;
- presenter notes and reveal cues;
- misconception warnings;
- suggested discussion questions;
- answer rationales and grading guidance;
- direct access to every question state and laboratory preset.

Do not expose instructor-only solutions or teaching notes in the default student view.

### 13.8 Versioning and provenance

Every deliverable must display or embed:

- course title;
- source filename;
- artifact and document version;
- production or revision date;
- transform and sinc conventions;
- content language;
- source-page citation policy;
- list of known ambiguities or unresolved issues;
- change summary relative to the previous version.

Use one shared version identifier across the artifact, lecture PDF, workbook, solutions, reference sheet, and verification reports.

---

## 14. Source traceability

For every learning scene maintain:

- scene number;
- instructional objective;
- visible content;
- equation or plot specification;
- interaction or reveal behavior;
- explanatory notes;
- an internal source reference in the form `[Source: EE311 Lecture Notes, PDF p. XX]`.

The internal source reference must remain hidden from the ordinary student-facing lecture notes. It may appear only in instructor metadata, provenance appendices, or separate verification ledgers.

Maintain a separate verification ledger linking:

- scene number;
- equation or claim;
- source page;
- textbook chapter, section, and printed page when used;
- external research citation when used;
- editorial modification;
- verification status;
- unresolved ambiguity.

Externally added claims or assets must include an authoritative citation.

---

## 15. Quality assurance

Before delivery:

- verify every equation against the source and standard definitions;
- verify that textbook use remains within the stated secondary-reference and copyright boundaries;
- verify that every research-derived claim and implementation decision is recorded in the research ledger;
- verify transform signs and scale factors;
- verify Fourier-series coefficient indices and periods;
- verify convolution limits and overlap intervals;
- verify CT versus DT notation;
- verify magnitude and phase plots;
- verify DTFT \(2\pi\)-periodicity;
- verify sampling units, inequalities, replica positions, and bandwidths;
- confirm that every diagram agrees with its equation;
- confirm that every symbol is defined;
- confirm that student-facing content reads as self-contained lecture notes in simple, direct language;
- scan all visible content and remove references to PDFs, files, uploads, source documents, conversion, research, redrawing, or verification work;
- confirm that source-page references and provenance labels appear only in permitted internal or instructor-facing locations;
- remove duplicated explanations;
- test every interaction, quiz, reveal, and navigation control;
- test lecture mode, self-study mode, and reduced-motion mode;
- test student and instructor editions separately;
- test offline behavior, reset, resume, search, deep links, and privacy defaults;
- test desktop and tablet layouts;
- run independent symbolic or numerical verification where applicable;
- confirm that the 88-page source-coverage matrix has no unmapped pages;
- confirm that question identifiers and answers agree across the artifact, workbook, and solutions;
- render every PDF page to an image and inspect it individually;
- fix all clipping, overlap, wrapping, broken links, low-resolution images, and unreadable equations;
- confirm that all final deliverables use the same verified content, notation, version identifier, and visual identity.

---

## 16. Final deliverables

Deliver:

1. the complete functional interactive EE311 learning artifact;
2. the main presentation-quality lecture PDF;
3. the student question-workbook PDF;
4. the instructor solutions PDF;
5. the concise formula, notation, and transform-pair reference PDF;
6. the complete source-coverage and source-to-scene traceability matrix;
7. the equation, question, and ambiguity audit;
8. the computational-verification results;
9. the controlled-research ledger and bibliography;
10. the textbook cross-reference ledger;
11. the version manifest and change summary;
12. a short quality-assurance report;
13. all non-copyrighted source files required to reproduce every output.

Do not include or redistribute `Book.pdf` in the final output package.

The final result must feel like a premium, coherent, and self-contained set of interactive Signals and Systems lecture notes, supported by rigorous and purpose-specific PDF editions - not like a source-review report or handwritten pages automatically converted into slides.
