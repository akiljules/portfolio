const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.argv[2]) || 5500;
const root = process.cwd();

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8"
};

function sendFile(response, targetPath) {
    fs.readFile(targetPath, (error, content) => {
        if (error) {
            response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Server error");
            return;
        }

        const extension = path.extname(targetPath).toLowerCase();
        response.writeHead(200, {
            "Content-Type": mimeTypes[extension] || "application/octet-stream"
        });
        response.end(content);
    });
}

const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const sanitizedPath = requestPath === "/" ? "/index.html" : requestPath;

    const absolutePath = path.join(root, sanitizedPath);
    const normalized = path.normalize(absolutePath);

    if (!normalized.startsWith(root)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
    }

    fs.stat(normalized, (error, stats) => {
        if (!error && stats.isFile()) {
            sendFile(response, normalized);
            return;
        }

        const fallbackIndex = path.join(normalized, "index.html");
        fs.stat(fallbackIndex, (indexError, indexStats) => {
            if (!indexError && indexStats.isFile()) {
                sendFile(response, fallbackIndex);
                return;
            }

            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Not found");
        });
    });
});

server.listen(port, () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
    console.log("Press Ctrl+C to stop.");
});
