import cron from "node-cron";
import { publishDueEventsAndNotify } from "../services/ticketOpeningService.js";

export function startScheduler() {
    // Jalan tiap 1 menit — cukup presisi karena sales_start_at cuma
    // punya granularitas menit
    cron.schedule("* * * * *", async () => {
        try {
            const count = await publishDueEventsAndNotify();
            if (count > 0) {
                console.log(`[scheduler] ${count} event dipublikasikan otomatis.`);
            }
        } catch (err) {
            console.error("[scheduler] Gagal jalankan job publish event:", err.message);
        }
    });
}