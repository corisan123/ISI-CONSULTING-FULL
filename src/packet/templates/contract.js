/**
 * Packet contract — engagement-ready skeleton for the named client.
 * Advisory language only. Final terms live in a signed SOW.
 */
import { firm } from "../firm.js";

var CLAUSES = [
  {
    title: "1. Parties",
    body:
      "This Diagnostic Packet is issued by " +
      firm.name +
      " (" +
      firm.division +
      ") to the client leadership team named in the header. It is a confidential advisory deliverable, not a public report."
  },
  {
    title: "2. Scope",
    body:
      "Scope is limited to the diagnostic outputs already produced: scoring results, activated engines, ranked initiatives, roadmap phases, and the narrative surfaces bound to this Packet ID. Implementation work, software, or hiring actions are out of scope unless a Statement of Work says otherwise."
  },
  {
    title: "3. Nature of advice",
    body:
      "Recommendations are advisory. " +
      firm.name +
      " does not guarantee specific revenue, margin, EBITDA, or operational results. Outcomes depend on client execution, market conditions, and facts not visible in the diagnostic inputs."
  },
  {
    title: "4. Confidentiality & IP",
    body:
      firm.confidentiality +
      " Models, templates, narrative tokens, and packet structure remain intellectual property of " +
      firm.name +
      ". The client may use findings internally to decide whether to engage. Redistribution requires written consent."
  },
  {
    title: "5. Fees",
    body:
      "Fees, if any, for work beyond this packet are set in a Statement of Work. This packet itself does not create a fee obligation unless the parties have already agreed in writing."
  },
  {
    title: "6. Next instrument",
    body:
      "If the client proceeds, the next instrument is a Statement of Work that names owners, windows, and commercial terms. Until that instrument is signed, this packet is informational."
  }
];

export function renderContract(packet) {
  var section = document.createElement("section");
  section.className = "isi-packet-section isi-packet-contract";
  var h = document.createElement("h2");
  h.textContent = "Engagement Terms (Packet)";
  section.appendChild(h);

  CLAUSES.forEach(function (c) {
    var art = document.createElement("article");
    var t = document.createElement("h3");
    t.textContent = c.title;
    var p = document.createElement("p");
    p.textContent = c.body;
    art.appendChild(t);
    art.appendChild(p);
    section.appendChild(art);
  });

  var sign = document.createElement("div");
  sign.className = "isi-packet-sign";
  ["For ISI Consulting", "For the Client"].forEach(function (label) {
    var col = document.createElement("div");
    var l = document.createElement("p");
    l.textContent = label;
    var line = document.createElement("div");
    line.className = "isi-packet-sign__line";
    var d = document.createElement("p");
    d.className = "isi-packet-muted";
    d.textContent = "Signature / date";
    col.appendChild(l);
    col.appendChild(line);
    col.appendChild(d);
    sign.appendChild(col);
  });
  section.appendChild(sign);

  if (packet && packet.meta && packet.meta.tokenHash) {
    var bind = document.createElement("p");
    bind.className = "isi-packet-muted";
    bind.textContent = "This contract copy is bound to token hash " + packet.meta.tokenHash + ".";
    section.appendChild(bind);
  }

  return section;
}

export default renderContract;
