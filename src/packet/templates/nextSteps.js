/**
 * Packet next steps — roadmap phases from existing roadmap output.
 */
export function renderNextSteps(packet) {
  var section = document.createElement("section");
  section.className = "isi-packet-section";
  var h = document.createElement("h2");
  h.textContent = "Next Steps";
  section.appendChild(h);

  var framing = packet.narrative && packet.narrative.blocks && packet.narrative.blocks.nextPhase;
  if (framing && framing.framing) {
    var p = document.createElement("p");
    p.className = "isi-packet-prose";
    p.textContent = framing.framing;
    section.appendChild(p);
  }

  var track = document.createElement("div");
  track.className = "isi-packet-phases";
  (packet.roadmap || []).forEach(function (phase, i) {
    var card = document.createElement("article");
    card.className = "isi-packet-phase";
    var index = document.createElement("span");
    index.className = "isi-packet-phase__index";
    index.textContent = i < 9 ? "0" + (i + 1) : String(i + 1);
    var title = document.createElement("h3");
    title.textContent = phase.phase || phase.name || "Phase";
    var focus = document.createElement("p");
    focus.textContent = phase.focus || "";
    var ul = document.createElement("ul");
    var source = phase.items && phase.items.length ? phase.items : phase.initiatives || [];
    source.slice(0, 4).forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : item.name || "";
      ul.appendChild(li);
    });
    card.appendChild(index);
    card.appendChild(title);
    if (phase.focus) card.appendChild(focus);
    if (ul.children.length) card.appendChild(ul);
    track.appendChild(card);
  });

  if (!track.children.length) {
    var empty = document.createElement("p");
    empty.textContent = "No roadmap phases are on file yet.";
    section.appendChild(empty);
  } else {
    section.appendChild(track);
  }
  return section;
}

export default renderNextSteps;
