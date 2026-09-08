/**
 * Phase 8 — placeholder narrative templates.
 * Token slots are filled by narrativeEngine.js. Does not score or activate engines.
 */

export var dashboardLead = {
  id: "dashboard-lead",
  title: "Dashboard lead",
  lead:
    "The binding constraint is {archetype}. {weakestLabel} is the weakest vital sign at {weakestScore} ({weakestRating}). Until that constraint moves, gains elsewhere will leak.",
  insights: [
    "{engineSummary}",
    "The first initiative on the ranked list is {topPriority}. Treat it as the 30-day truth test, not as a parallel workstream.",
    "Activated domains: {activatedList}."
  ],
  rationale:
    "Vital signs read {revenueRating} revenue, {marginRating} margin, {operationsRating} operations, and {leadershipRating} leadership. That pattern is why {archetype} is the constraint — not a generic improvement catalogue.",
  nextPhaseFraming:
    "The next execution window is {nextPhase}, focused on {nextPhaseFocus}. Do not skip it to chase later-phase architecture."
};

export var roadmapExplanation = {
  id: "roadmap-explanation",
  title: "Roadmap explanation",
  lead:
    "This roadmap is a sequence, not a backlog. Each window assumes the prior one held. {nextPhase} exists to {nextPhaseFocus}.",
  insights: [
    "Work in the first window is deliberately narrower than the full initiative list. Breadth is how constraints survive.",
    "Later phases ({laterPhases}) are options earned by finishing {nextPhase}, not parallel tracks.",
    "{topPriority} belongs near the front of the plan because it attacks the binding constraint first."
  ],
  rationale:
    "The diagnostic does not produce four copies of the same two actions. Phases pull different work from the merged libraries so the commercial, expansion, and alignment problems are sequenced rather than averaged.",
  nextPhaseFraming:
    "Hold the organization to {nextPhase}: {nextPhaseFocus}. If that window slips, later phases are fiction."
};

export var summaryBrief = {
  id: "summary-executive-brief",
  title: "Summary executive brief",
  lead:
    "{headline}",
  insights: [
    "{situation}",
    "{implication}",
    "Root-cause signals: {rootCauseList}."
  ],
  rationale:
    "We recommend {recommendation} The ranked starting move is {topPriority}. Scores sit at revenue {revenueScore}, margin {marginScore}, operations {operationsScore}, leadership {leadershipScore}.",
  nextPhaseFraming:
    "Ask the leadership team to own {nextPhase} ({nextPhaseFocus}) before authorizing Horizon-2 spend or a second operating system."
};

export var templates = {
  dashboardLead: dashboardLead,
  roadmapExplanation: roadmapExplanation,
  summaryBrief: summaryBrief
};

export default templates;
