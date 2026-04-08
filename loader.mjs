/**
 * Entry point wrapper cho production và development.
 * Load file .env TRƯỚC KHI import app để DATABASE_URL
 * và các biến khác được set trước khi DB pool khởi tạo.
 *
 * override: true  →  giá trị trong .env LUÔN THẮNG,
 *                     kể cả khi hệ thống (Replit/Plesk) đã inject biến đó.
 *
 * Usage (từ project root):
 *   node loader.mjs
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env từ project root — override bất kỳ biến đã inject từ ngoài
config({ path: path.resolve(__dirname, ".env"), override: true });
// Fallback: .env từ thư mục hiện tại
config({ path: path.resolve(process.cwd(), ".env"), override: true });

await import("./dist/index.mjs");
