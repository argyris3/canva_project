import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Layers3,
  MessageSquareText,
  MousePointer2,
  PenLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Think with an AI partner",
    text: "Ask for diagrams, summaries, next steps, and structured plans without leaving the canvas.",
  },
  {
    icon: Layers3,
    title: "Organize messy ideas",
    text: "Group sketches, notes, flows, and references into boards that stay readable as work grows.",
  },
  {
    icon: MessageSquareText,
    title: "Move from prompt to board",
    text: "Capture strategy sessions, product flows, and research threads as visual working documents.",
  },
];

// Keep the landing page content data-driven so copy and icons can change without touching layout markup.
const workflow = [
  "Start with a blank board or AI prompt",
  "Turn rough thoughts into visual structure",
  "Refine, archive, and revisit every project",
];

// Positions are Tailwind classes because the preview is a static illustration, not a real canvas.
const canvasNodes = [
  {
    label: "User goal",
    className: "left-[8%] top-[18%] bg-[#e8f2ff] text-[#184c91]",
  },
  {
    label: "AI expands context",
    className: "right-[9%] top-[25%] bg-[#f0eaff] text-[#553c9a]",
  },
  {
    label: "Sketch the flow",
    className: "left-[23%] top-[55%] bg-[#e9fbf4] text-[#146c4d]",
  },
  {
    label: "Ship-ready plan",
    className: "right-[18%] bottom-[14%] bg-[#fff5dc] text-[#75520a]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#eef6ff_100%)]">
        <div
          className="absolute inset-0 opacity-[0.42]"
          style={{
            backgroundImage:
              "linear-gradient(#d9e4f2 1px, transparent 1px), linear-gradient(90deg, #d9e4f2 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Whizboard home"
          >
            <Image src="/logo.svg" alt="" width={36} height={36} priority />
            <span className="text-lg font-semibold tracking-normal text-slate-950">
              Canva_Project
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#workspace" className="transition hover:text-slate-950">
              Workspace
            </a>
            <a href="#workflow" className="transition hover:text-slate-950">
              Workflow
            </a>
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden h-10 items-center rounded-md px-4 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-82px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:pb-20 lg:pt-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white/80 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
              <Sparkles className="size-4" />
              Agentic canvas for ideas, systems, and strategy
            </div>

            <h1 className="text-5xl font-bold leading-[1.04] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              Build clearer ideas on an AI whiteboard.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Whizboard helps teams turn rough thinking into structured
              diagrams, visual notes, and project boards with an AI collaborator
              built into the workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-base font-semibold text-white shadow-[0_14px_30px_rgba(47,107,255,0.25)] transition hover:bg-blue-700"
              >
                Create your first board
                <ArrowRight className="size-5" />
              </Link>
              <a
                href="#workspace"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                View workspace
                <ChevronRight className="size-5" />
              </a>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              <Metric value="AI" label="assisted thinking" />
              <Metric value="∞" label="canvas space" />
              <Metric value="1" label="place for projects" />
            </div>
          </div>

          <div id="workspace" className="relative">
            <WorkspacePreview />
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-b border-slate-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.76fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Productive canvas
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              A landing place for the work before the work.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Capture discovery sessions, architecture ideas, product flows, and
              planning notes in a workspace that can reason with you.
            </p>
          </div>

          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-base font-semibold text-slate-800">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#f8fafc] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Capabilities
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Everything on the board can become the next useful artifact.
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex size-11 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-normal text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-normal text-slate-950">
        {value}
      </div>
      <div className="mt-1 text-sm leading-5 text-slate-500">{label}</div>
    </div>
  );
}

function WorkspacePreview() {
  // This preview mirrors the app's core whiteboard mental model without loading Excalidraw on the marketing page.
  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#fd4873]" />
            <span className="size-3 rounded-full bg-[#ffc700]" />
            <span className="size-3 rounded-full bg-[#00b88a]" />
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 sm:flex">
            <Bot className="size-3.5 text-blue-600" />
            AI workspace active
          </div>
        </div>

        <div className="grid min-h-[430px] grid-cols-[54px_1fr] bg-white sm:min-h-[520px]">
          <aside className="flex flex-col items-center gap-3 border-r border-slate-200 bg-slate-50 py-4">
            {[
              { icon: MousePointer2, label: "Select" },
              { icon: PenLine, label: "Draw" },
              { icon: WandSparkles, label: "AI tools" },
              { icon: MessageSquareText, label: "Comments" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </aside>

          <div
            className="relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 640 480"
              fill="none"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <path
                d="M142 112 C255 148 300 132 404 124"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
              <path
                d="M420 158 C366 234 304 258 210 294"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
              <path
                d="M260 326 C362 314 402 362 488 382"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
            </svg>

            {canvasNodes.map((node) => (
              <div
                key={node.label}
                className={`absolute rounded-md border border-white/70 px-4 py-3 text-sm font-bold shadow-md ${node.className}`}
              >
                {node.label}
              </div>
            ))}

            <div className="absolute left-[34%] top-[30%] w-[210px] rounded-md border border-blue-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950">
                <Sparkles className="size-4 text-blue-600" />
                AI synthesis
              </div>
              <div className="space-y-2">
                {[
                  "Map the decision path",
                  "Find missing assumptions",
                  "Create next actions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600"
                  >
                    <Check className="size-3.5 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md border border-slate-200 bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-950">
                  Product strategy board
                </div>
                <div className="truncate text-xs text-slate-500">
                  18 elements, 4 AI-generated clusters
                </div>
              </div>
              <button className="ml-3 inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-bold text-white">
                Ask AI
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-8 hidden rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg lg:block">
        From sketch to structured plan
      </div>
    </div>
  );
}
