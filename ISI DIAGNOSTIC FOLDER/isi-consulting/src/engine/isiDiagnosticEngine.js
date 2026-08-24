/**
 * ISI Consulting — isiDiagnosticEngine.js (Block 3C)
 * Global automation wrapper: session accessors + future API/CRM/webhook stubs.
 * Depends on isiConfig.js loaded first.
 */
const isiDiagnosticEngine = {
  config: typeof isiConfig !== "undefined" ? isiConfig : null,

  // -----------------------------
  // 1. RAW DATA ACCESSORS
  // -----------------------------
  getInput() {
    try {
      var raw =
        sessionStorage.getItem("isi_input") ||
        sessionStorage.getItem("isi_diagnosticInput");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("getInput failed:", err);
      return null;
    }
  },

  getScoring() {
    try {
      var raw = sessionStorage.getItem("isi_scoringResults");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("getScoring failed:", err);
      return null;
    }
  },

  getDecisionTree() {
    try {
      var raw = sessionStorage.getItem("isi_decisionTree");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("getDecisionTree failed:", err);
      return null;
    }
  },

  getPrioritization() {
    try {
      var raw = sessionStorage.getItem("isi_prioritization");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("getPrioritization failed:", err);
      return null;
    }
  },

  getRoadmap() {
    try {
      var raw = sessionStorage.getItem("isi_roadmap");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("getRoadmap failed:", err);
      return null;
    }
  },

  getSummary() {
    return {
      scoring: this.getScoring(),
      decision: this.getDecisionTree(),
      priorities: this.getPrioritization(),
      roadmap: this.getRoadmap()
    };
  },

  // -----------------------------
  // 2. FUTURE API HOOKS (STUBS)
  // -----------------------------
  async sendToCRM() {
    console.log("CRM Hook: Future integration point.", this.config && this.config.crmEndpoint);
    alert("CRM integration will be available in a future release.");
  },

  async sendToWebhook() {
    console.log("Webhook Hook: Future integration point.", this.config && this.config.webhookEndpoint);
    alert("Webhook integration will be available in a future release.");
  },

  async saveToCloud() {
    console.log("Cloud Save: Future integration point.", this.config && this.config.cloudEndpoint);
    alert("Cloud save will be available in a future release.");
  },

  async exportJSON() {
    const data = this.getSummary();
    console.log("Export JSON:", data);
    alert("JSON export will be available in a future release.");
  }
};

if (typeof window !== "undefined") {
  window.isiDiagnosticEngine = isiDiagnosticEngine;
}
