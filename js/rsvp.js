(function (root) {
  "use strict";
  var endpoint = "/weddingsamuelledy/api/rsvp";

  async function request(method, entry) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 25000);
    try {
      var response = await fetch(endpoint, {
        method: method,
        credentials: "same-origin",
        cache: "no-store",
        headers: method === "POST" ? {"Content-Type": "application/json"} : {},
        body: method === "POST" ? JSON.stringify(entry) : undefined,
        signal: controller.signal
      });
      var result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error("RSVP belum tersimpan. Silakan coba lagi.");
      return result.entry;
    } catch (error) {
      throw new Error("RSVP belum tersimpan. Periksa koneksi lalu coba kirim lagi.");
    } finally {
      clearTimeout(timer);
    }
  }

  var client = {
    save: function (entry) { return request("POST", entry); },
    load: function () { return request("GET"); }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = client;
  else root.WeddingRsvp = client;
})(typeof window !== "undefined" ? window : globalThis);
