"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./page.module.css";

type Slide = {
  title: string;
  subtitle?: string;
  points: string[];
  payoff: string;
};

const slides: Slide[] = [
  {
    title: "Build Persuasive Communication",
    subtitle: "Narrative thinking sharpens how you speak, write, and pitch.",
    points: [
      "Literary analysis trains you to shape ideas into compelling story arcs.",
      "Rich vocabulary makes reports, emails, and pitches feel confident.",
      "Voice control from close reading improves the tone of client updates.",
    ],
    payoff:
      "Teams backed by strong communicators close deals faster and reduce feedback loops.",
  },
  {
    title: "Grow Empathy for Stakeholders",
    subtitle: "Characters and conflicts mirror the people you collaborate with.",
    points: [
      "Understanding multiple points-of-view lowers friction in cross-functional work.",
      "Recognising subtle motivations helps with coaching and performance reviews.",
      "Literature’s emotional range prepares you for tough conversations with grace.",
    ],
    payoff:
      "Empathic leadership keeps retention high and powers customer-obsessed cultures.",
  },
  {
    title: "Strengthen Critical Analysis",
    subtitle: "Close reading mirrors how you dissect briefs, data, and decisions.",
    points: [
      "Identifying themes teaches you to surface patterns in metrics and research.",
      "Evaluating unreliable narrators builds healthy scepticism in due diligence.",
      "Comparative reading translates into sharper competitive and market analyses.",
    ],
    payoff:
      "Sharper analysis turns raw information into confident recommendations stakeholders trust.",
  },
  {
    title: "Fuel Creativity & Innovation",
    subtitle: "Exposure to diverse styles unlocks original solutions at work.",
    points: [
      "Metaphors reframe problems so teams escape default solutions.",
      "Genre-bending texts normalise experimentation in product roadmaps.",
      "Symbolism encourages playful visuals and copy for campaigns or decks.",
    ],
    payoff:
      "Inventive teams ship experiences that stand out and feel human-centred.",
  },
  {
    title: "Sustain Resilience & Wellbeing",
    subtitle: "Stories model how people navigate uncertainty and change.",
    points: [
      "Plot twists train you to scenario-plan and stay calm when plans shift.",
      "Motifs of perseverance remind teams why their mission matters.",
      "Reflective journaling borrowed from lit studies grounds personal growth.",
    ],
    payoff:
      "Grounded professionals bounce back faster and support peers through pressure cycles.",
  },
];

export default function Home() {
  const slidesRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    if (!slidesRef.current || isGenerating) {
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const slideElements = Array.from(
        slidesRef.current.querySelectorAll<HTMLElement>("[data-slide]")
      );

      if (slideElements.length === 0) {
        throw new Error("Slides not found.");
      }

      let pdf: InstanceType<typeof jsPDF> | null = null;

      for (let index = 0; index < slideElements.length; index += 1) {
        const element = slideElements[index];
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });

        const imageData = canvas.toDataURL("image/png");
        const orientation =
          canvas.width >= canvas.height ? "landscape" : "portrait";

        if (pdf === null) {
          pdf = new jsPDF({
            orientation,
            unit: "px",
            format: [canvas.width, canvas.height],
          });
        } else {
          pdf.addPage([canvas.width, canvas.height], orientation);
          pdf.setPage(index + 1);
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      }

      pdf?.save("english-literature-practical-benefits.pdf");
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to create PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>English Literature in Practice</p>
        <h1>
          Five slide story on how literature skills unlock everyday advantages.
        </h1>
        <p className={styles.lede}>
          Explore the concrete ways literary training strengthens communication,
          leadership, and resilience across modern workplaces.
        </p>
        <button
          type="button"
          className={styles.downloadButton}
          onClick={handleDownload}
          disabled={isGenerating}
          aria-busy={isGenerating}
        >
          {isGenerating ? "Creating PDF…" : "Download PDF"}
        </button>
        {errorMessage ? (
          <p className={styles.error} role="status">
            {errorMessage}
          </p>
        ) : null}
      </header>

      <main className={styles.slidesWrapper} ref={slidesRef}>
        {slides.map((slide, index) => (
          <section
            key={slide.title}
            className={styles.slide}
            data-slide
            aria-labelledby={`slide-${index + 1}`}
          >
            <div className={styles.slideMeta}>
              <span className={styles.slideNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.slideLabel}>Slide {index + 1}</span>
            </div>
            <h2 id={`slide-${index + 1}`}>{slide.title}</h2>
            {slide.subtitle ? (
              <p className={styles.subtitle}>{slide.subtitle}</p>
            ) : null}
            <ul className={styles.points}>
              {slide.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className={styles.payoff}>
              <span className={styles.payoffLabel}>Practical payoff</span>
              <p>{slide.payoff}</p>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
