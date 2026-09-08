/**
 * Packet footer — legal, confidentiality, copyright.
 */
import { firm } from "../firm.js";

export function renderFooter(packet) {
  var footer = document.createElement("footer");
  footer.className = "isi-packet-footer";

  var conf = document.createElement("p");
  conf.className = "isi-packet-footer__confidential";
  conf.textContent = firm.confidentiality;
  footer.appendChild(conf);

  var legal = document.createElement("p");
  legal.className = "isi-packet-footer__legal";
  legal.textContent =
    "This packet is an advisory deliverable. It does not guarantee financial or operational outcomes. Modeling is illustrative and derived from diagnostic inputs already on file. Formal engagement terms, if any, are set in a Statement of Work.";
  footer.appendChild(legal);

  var copy = document.createElement("p");
  copy.className = "isi-packet-footer__copy";
  copy.textContent = firm.copyright;
  footer.appendChild(copy);

  if (packet && packet.meta) {
    var id = document.createElement("p");
    id.className = "isi-packet-footer__hash";
    id.textContent =
      "Packet ID " +
      (packet.meta.id || "—") +
      " · Token hash " +
      (packet.meta.tokenHash || "—");
    footer.appendChild(id);
  }

  return footer;
}

export default renderFooter;
