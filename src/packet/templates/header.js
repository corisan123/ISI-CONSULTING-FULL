/**
 * Packet header — logo mark, address, phone, email.
 */
import { firm } from "../firm.js";

export function renderHeader(packet) {
  var header = document.createElement("header");
  header.className = "isi-packet-header";

  var brand = document.createElement("div");
  brand.className = "isi-packet-header__brand";

  var mark = document.createElement("div");
  mark.className = "isi-packet-logo";
  mark.setAttribute("aria-hidden", "true");
  brand.appendChild(mark);

  var names = document.createElement("div");
  var h = document.createElement("p");
  h.className = "isi-packet-header__name";
  h.textContent = firm.name;
  var t = document.createElement("p");
  t.className = "isi-packet-header__tagline";
  t.textContent = firm.tagline;
  names.appendChild(h);
  names.appendChild(t);
  brand.appendChild(names);

  var contact = document.createElement("div");
  contact.className = "isi-packet-header__contact";
  var lines = [
    firm.address.join(" · "),
    firm.phone,
    firm.email,
    packet && packet.meta && packet.meta.issuedTo ? "Prepared for: " + packet.meta.issuedTo : "Prepared for: Client leadership"
  ];
  lines.forEach(function (line) {
    var p = document.createElement("p");
    p.textContent = line;
    contact.appendChild(p);
  });

  header.appendChild(brand);
  header.appendChild(contact);
  return header;
}

export default renderHeader;
