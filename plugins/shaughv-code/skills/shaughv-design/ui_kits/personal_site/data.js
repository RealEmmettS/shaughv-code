// SHAUGHV /works data — a slimmed-down version of the production works array.
// Source: RealEmmettS/emmetts_personal_website/src/lib/works.ts

window.WORKS = [
  { id: "emmettshaughnessy", name: "Emmett Shaughnessy", domain: "emmettshaughnessy.com", url: "https://emmettshaughnessy.com", category: "site", year: "2026", description: "The brutalist, typography-first personal portfolio.", tech: "Next.js, React, Tailwind", size: "lg", featured: true },
  { id: "shaughv", name: "SHAUGHV", domain: "shaughv.com", url: "https://shaughv.com", category: "site", year: "2025", description: "Home of the SHAUGHV brand mark and personal identity system.", tech: "Next.js, React", size: "md" },
  { id: "qubetx", name: "QubeTX", domain: "qubetx.com", url: "https://qubetx.com", category: "site", year: "2025", description: "Professional website development, maintenance, and backend API infrastructure for modern digital businesses.", tech: "Next.js, React, Tailwind", size: "lg", featured: true, inSelected: true },
  { id: "foundry", name: "Foundry", domain: "foundry.qubetx.com", url: "https://foundry.qubetx.com", category: "subdomain", year: "2026", description: "QubeTX Foundry — an internal-facing tooling surface.", tech: "Next.js, React", size: "sm" },
  { id: "magz", name: "MAGZ Marketing", domain: "magzmarketing.com", url: "https://magzmarketing.com", category: "site", year: "2025", description: "Marketing platform at the intersection of AI, athlete influence, and social distribution.", tech: "TypeScript, React, Pretext", size: "lg", featured: true, inSelected: true },
  { id: "dorsey", name: "Leon Lee Dorsey", domain: "leonleedorsey.com", url: "https://leonleedorsey.com", category: "site", year: "2023", description: "Personal website for jazz musician Leon Lee Dorsey.", tech: "Squarespace, CSS, JS", size: "md", inSelected: true },
  { id: "gvalley", name: "Green Valley", domain: "gvalleytx.com", url: "https://gvalleytx.com", category: "site", year: "2024", description: "A local lawn service and residential gardening company website redesign.", tech: "Squarespace, CSS, JS", size: "md", inSelected: true },
  { id: "tikset", name: "Tikset", domain: "tikset.com", url: "https://tikset.com", category: "tool", year: "2026", description: "A simple, clean way to set and check watch times — a personal alternative to time.gov.", tech: "Next.js, React, TypeScript", size: "md", inSelected: true },
  { id: "speedqx", name: "SpeedQX", domain: "speedqx.com", url: "https://speedqx.com", category: "tool", year: "2026", description: "The standalone SpeedQX property — a speed-test experience for end users.", tech: "Next.js, React, M-Lab API", size: "md" },
  { id: "qork", name: "Qork", domain: "qork.me", url: "https://qork.me", category: "tool", year: "2025", description: "Qork — a utility brand hosting compact everyday tools.", tech: "Next.js, React", size: "sm" },
  { id: "resume", name: "Resume", domain: "resume.emmetts.dev", url: "https://resume.emmetts.dev", category: "subdomain", year: "2025", description: "A continuously updated online resume.", tech: "HTML, CSS, Print styles", size: "sm" },
  { id: "timer", name: "Timer", domain: "timer.emmetts.dev", url: "https://timer.emmetts.dev", category: "subdomain", year: "2025", description: "A minimal full-screen timer utility.", tech: "HTML, JS, CSS", size: "sm" },
  { id: "qork-qr", name: "Qork QR", domain: "qr.qork.me", url: "https://qr.qork.me", category: "subdomain", year: "2025", description: "A fast, ad-free QR-code generator under the Qork brand.", tech: "Next.js, React", size: "sm" },
  { id: "qubetx-reports", name: "QubeTX Machine Reports", domain: "reports.qubetx.com", url: "https://reports.qubetx.com", category: "report", year: "2026", description: "Cross-platform machine reporting CLI with Unicode table output, JSON mode, and self-installing shell integration.", tech: "Rust, Shell, PowerShell", size: "lg", featured: true, inSelected: true, children: [ { domain: "nd300", url: "https://reports.qubetx.com/nd300" }, { domain: "sd300", url: "https://reports.qubetx.com/sd300" }, { domain: "shaughvOS", url: "https://reports.qubetx.com/shaughvOS" } ] },
  { id: "magic-pantry", name: "Magic Pantry 2", domain: "App Store", url: "https://apps.apple.com/us/app/magic-pantry-2/id6757911019", category: "app", year: "2025", description: "AI-powered grocery list app that organizes items by store aisle — shop smarter, not harder.", tech: "Swift, SwiftUI, AI", size: "md", appStore: true, inSelected: true },
  { id: "speedqx-ios", name: "SpeedQX", domain: "App Store", url: "https://apps.apple.com/us/app/speedqx/id6760538784", category: "app", year: "2026", description: "The native iOS companion to SpeedQX — a polished, mobile-first speed test.", tech: "Swift, SwiftUI", size: "md", appStore: true },
];

window.FILTER_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "site", label: "Sites" },
  { id: "subdomain", label: "Subdomains" },
  { id: "tool", label: "Tools" },
  { id: "report", label: "Reports" },
  { id: "app", label: "Apps" },
];

window.PROJECTS = [
  { title: "QubeTX Machine Reports", category: "Developer Tools", year: "2026", description: "Cross-platform machine reporting CLI with Unicode table output, JSON mode, and self-installing shell integration.", tech: "Rust, Shell, PowerShell", link: "https://reports.qubetx.com" },
  { title: "MAGZ Marketing", category: "Marketing", year: "2025", description: "Marketing platform at the intersection of AI, athlete influence, and social distribution.", tech: "TypeScript, React, Pretext", link: "https://magzmarketing.com" },
  { title: "Speedtest by QubeTX", category: "Web Tool", year: "2026", description: "Internet speed testing tool measuring ping, jitter, download, and upload speeds, powered by M-Lab.", tech: "Next.js, React, M-Lab API", link: "https://speedtest.qubetx.com" },
  { title: "Magic Pantry", category: "iOS App", year: "2025", description: "AI-powered grocery list app that organizes items by store aisle — shop smarter, not harder.", tech: "Swift, SwiftUI, AI", link: "https://apps.apple.com/us/app/magic-pantry-2/id6757911019" },
  { title: "Leon Lee Dorsey", category: "Portfolio", year: "2023", description: "Personal website for jazz musician Leon Lee Dorsey.", tech: "Squarespace, CSS, JS", link: "https://leonleedorsey.com" },
  { title: "Tikset", category: "Web Tool", year: "2026", description: "A simple, clean way to set and check watch times — a personal alternative to time.gov.", tech: "Next.js, React, TypeScript", link: "https://tikset.com" },
  { title: "QubeTX", category: "Corporate", year: "2025", description: "Professional website development, maintenance services, and backend API infrastructure for modern digital businesses.", tech: "Next.js, React, Tailwind", link: "https://qubetx.com" },
  { title: "Green Valley", category: "Web Development", year: "2024", description: "A local lawn service and residential gardening company website redesign.", tech: "Squarespace, CSS, JS", link: "https://gvalleytx.com" },
];
