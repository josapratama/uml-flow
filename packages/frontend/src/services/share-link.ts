/**
 * Share Link Service
 * Encodes diagram DSL code into compressed URL hashes (gzip + base64url)
 * for seamless client-side diagram sharing without needing a database backend.
 */

export async function encodeShareCode(code: string): Promise<string> {
  try {
    if (typeof CompressionStream !== "undefined") {
      const stream = new Blob([new TextEncoder().encode(code)])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
      const compressedBuffer = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(compressedBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return (
        "gz." +
        btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
      );
    }
  } catch {
    // fallback to uncompressed base64url
  }

  const bytes = new TextEncoder().encode(code);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return (
    "b64." +
    btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  );
}

export async function decodeShareCode(encoded: string): Promise<string> {
  const isGz = encoded.startsWith("gz.");
  const clean = encoded.replace(/^(gz\.|b64\.)/, "");
  let base64 = clean.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (isGz && typeof DecompressionStream !== "undefined") {
    try {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
      return await new Response(stream).text();
    } catch {
      // Fallback
    }
  }

  return new TextDecoder().decode(bytes);
}

/**
 * Returns a full shareable URL containing the diagram code in the hash.
 */
export async function createShareUrl(code: string): Promise<string> {
  const hash = await encodeShareCode(code);
  const url = new URL(window.location.href);
  url.hash = `share=${hash}`;
  return url.toString();
}

/**
 * Checks window.location.hash for shareable diagram code.
 */
export async function getSharedCodeFromLocation(): Promise<string | null> {
  const hash = window.location.hash;
  if (!hash) return null;

  const match = hash.match(/[#&](?:share|code)=([^&]+)/);
  if (!match || !match[1]) return null;

  try {
    return await decodeShareCode(decodeURIComponent(match[1]));
  } catch (err) {
    console.error("Failed to decode shared diagram from URL:", err);
    return null;
  }
}
