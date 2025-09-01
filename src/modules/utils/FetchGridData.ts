import pako from "pako";

/**
 * Fetches a GZIP-compressed binary file, decompresses it using DecompressionStream (with fallback),
 * and returns the decompressed Uint8Array.
 *
 * @param url - The URL to fetch (can be RequestInfo)
 * @param options - Optional fetch init options
 * @returns Promise resolving to decompressed Uint8Array
 */
export async function fetchAndDecompressGzip(
    url: RequestInfo,
    options: RequestInit = {}
): Promise<Uint8Array> {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip"); // doesn't matter much, browsers ignore for fetch
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const encoding = response.headers.get("Content-Encoding");
    const arrayBuffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // If encoding is not set, check raw bytes for gzip magic number
    const looksLikeGzip = uint8[0] === 0x1f && uint8[1] === 0x8b;

    if (encoding?.toLowerCase() === "gzip" || looksLikeGzip) {
        // Need to manually decompress only if browser didn't already
        // In browsers, encoding="gzip" means browser already decompressed, so skip
        if (looksLikeGzip) {
            // Manual decompression
            if ("DecompressionStream" in window) {
                const ds = new DecompressionStream("gzip");
                const decompressedStream = new Response(uint8.buffer).body!.pipeThrough(ds);
                const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
                return new Uint8Array(decompressedBuffer);
            } else {
                console.log("Using PAKO");
                return pako.ungzip(uint8);
            }
        }
    }

    return uint8;
}


export async function fetchAsJSONGzip(
    url: RequestInfo,
    options: RequestInit = {}
): Promise<Uint8Array> {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip"); // doesn't matter much, browsers ignore for fetch
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
